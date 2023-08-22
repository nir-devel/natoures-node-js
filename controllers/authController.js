const crypto = require('crypto');
// const promisify = require('util').promisify;
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');

const AppError = require('./../utils/appError');
const { decode } = require('punycode');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  //Create a user with only necearry properties
  //   const newUser = await User.create(req.body);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    test: req.body.test,
    role: req.body.role,
  });

  console.log('in sighnup method - new user created:');
  console.log(newUser);
  //Signin the token(in Mongoose db the id is _id)
  //ex - after the time I specify in the 3 parameters the jwt will be expired
  const token = signToken(newUser._id);
  //   jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });

  //Send the token to the client - that all need to be done to login a client when it is signup
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  //READ CREDENTIAL DATA FROM THE REQUEST:email, password - OBJECT DESTRUCTRING - ES6
  const { email, password } = req.body;

  //1.Checkif email and password exist in the request
  //if not exits - my global error middleware will pick this error up and send it to the client
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  //Fake token - to test step 1- if there are not email or  password
  //2.Check if user exists in the db(by query it using based on email - need findOne(filter)) && the password is correct
  // const user = User.findOne({ email: email });
  //USING ES6 -abreviation
  //AFTER REMOVE THE PASSWORD FROM THE OUTPUT (by setting select:false in the userShcema , and provide the GET route /users)
  //I STILL NEED A WAY OF GETTING THE PASSWORD HERE IN TEH CODE - FOR THE AUTHENTICATION!
  const user = await User.findOne({ email }).select('+password');

  //Compare the 2 hadhed passwords(user input and the one in the found in the db - use the bcrypt.compare)
  //Since the passwords are hashed - there is no way of getting the original password!! I need to encypt the user password before
  //comparring it with the already encrypted in the db
  //Create a function for doing this in the Model -using instance methods
  //availble on the user instance (document of the UserShcema)

  //correct may be null - move this code to the OR condition
  //const correct = await user.correct(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3.If all good - send the toke back to the client
  const token = signToken(user._id);
  console.log(user);

  res.status(200).json({
    data: {
      status: 'success',
      token,
    },
  });
});

/**
 * NOTES:
 *  1.Promisify the jwt.verify callbased API function with async behaviour
 *  2.ERROR HANDLING: instead of handling errors in this method - delgete to my global m.w error handling
 */
exports.protect = catchAsync(async (req, res, next) => {
  //STEP 1: Check if there is a token in the request(if not 400) => DONE!!!
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  ////////////////////////////////////////////////
  //STEP 2:VERIFICATION  - verifythe token (the JWT algorithm verifies if the signature is valid or not => if the token is valid or not)
  ////////////////////////////////////
  //Possible 2 Errors of JWT : JsonWebTokenError, and token expired
  //console.log(decoded) - ok  : { id: '64de91425cb8d017a4397ce4', iat: 1692347603, exp: 1700123603 }
  //SAME decoded value for andy token generated - as long as the payload is not tempared
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //STEP 3: CHECK IF USER STILL EXISTS
  //the id I put in the payload is exactly for this case - when I need to check if the user exists
  const currentUser = await User.findById(decoded.id);

  //WHY HE DID NOT  HANDLE THIS ERROR WHEN USER DELETED IN PRODUCTION - NO MESSAGE IN POSTMAN?? JUST DEV WORKS!
  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to the token does no longer exist.',
        401,
      ),
    );

  console.log(
    `User changed password after: ${currentUser.changedPasswordAfter(
      decoded.iat,
    )}`,
  );
  //STEP 4:CHECK IF USER CHAGNED PASSWORD AFTER THE TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  //THIS IS USED TO PASS THE ROLES FOR THE NEXT M.W FUNCTION - restrictTo - for authorization
  req.user = currentUser;
  next();
});

/**AUTHORIZATION
 * 1.A HIGH ORDER FUNCTION THAT CREATED AND RETURNS A M.W THAT ACCEPTS ARGS!!
 *   (I can not do this in m.w DIRECTLRY! )
 *
 * 2.TAKES an arbitrary #args (roles)
 *
 * 3.CLOUSRE: the inner function has access to the roles -
 *
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log('INSIDE restrictTo m.w: The roles in the rest param:');
    // roles.forEach((role) => console.log(role));
    //READ THE user.role set in the last m.w in the stack (the protect for login)

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perfomr this action', 403),
      );
    }
    roles.forEach((role) => console.log(role));
    next();
  };
};

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   //1.Get user based on posted email
//   const user = await User.findOne({ email: req.body.email });

//   if (!user)
//     return next(new AppError('There is no user with email address', 404));

//   //2.Genrerate the random token
//   const resetToken = user.createPasswordResetToken();
//   //I MODIFY THE DATA - BUT NOT SAVE THE DATA - I NEED TO SAVED IT

//   //DEACTIVATE REQUIRED FIELDS WHEN SAVING A DOCUMENTS!- I want to save aonly the reset token
//   await user.save({ validateBeforeSave: false });

//   //3Send the token to the user's email
//   next();
// });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  /////////////////////////////
  //1.Get user based on posted email
  ///////////////////////////////////
  const user = await User.findOne({ email: req.body.email });
  //console.log(user);
  if (!user)
    return next(new AppError('There is no user with email address', 404));

  console.log('USER FOUND BY EMAIL:');
  console.log(user);

  //2.Genrerate the random token
  //This will set the reset token property() and the timeout property for 10 mins
  const resetToken = user.createPasswordResetToken();
  //I MODIFY THE DATA - BUT NOT SAVE THE DATA - I NEED TO SAVED IT
  //DEACTIVATE REQUIRED FIELDS WHEN SAVING A DOCUMENTS!- I want to save aonly the reset token
  await user.save({ validateBeforeSave: false });

  //3)Send the token to the user's email
  //Recreate the the link to work in dev and in prod
  //Send the original plain-text password - and not the hashed one -
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  //give the user instructions when it opens his email
  const message = `Forgot your password? Submit a PATCH request with 
  your new password and password confirm to:${resetURL}.\nIf  didn't  forget your password, please ignore this email! `;

  //SHOULD HANDLE ERRORS - BUT IT IS NOT ENOUGH TO SIMPLY SEND AN ERROR MESSAGE!
  //BECAUSE I  must TO ALSO SET BACK THE PASSWORD RESET TOKEN AND THE PASSWORD RESET EXPIRED IN THE DB
  //IT IS NOT ENOUGH TO SEND THE ERROR TO THE GLOBAL M.W ERROR HANDLING - I NEED TO TRY-CATCH BLOCK HERE!
  try {
    await sendEmail({
      //or req.body.email
      email: user.email,
      subject: 'Your password reset token(valid for 10min)',
      message,
    });

    //To finish the request-response cycle
    //(DONT SEND THE RESET TOKEN HERE - OTHERWISE ANYONE CAN RESET ANYONE PASSWORD AND TAKE OVER THE ACCOUNT
    //THAT'S THE ALL REASONE WHY I SEND THE TOKEN TO THE EMAIL ! I ASSUME THE EMAIL IS A SAFE PLACE ONLY THE USER ACCESS TO!
    res.status(200).json({
      stautus: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    //ERROR HANDLING - AGIAIN - NOT ENOUGH TO SEND TO G M.W ERROR HANDLING - I NEED TO REMOVE THE resets values from the user document
    //RESET BOTH TOKEN AND PASSWORD RESET EXPIRES

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //THE LAST 2 LINES ONLY MODIFY THE DATA - BUT DID NOT PERSIST IT - I NEED TO SAVE IT - BY DEACTIVATE THE VALIDATORS OF OTHER FIELDS
    await user.save({ validateBeforeSave: false });

    //Return a new AppError to the Global Error handling m.w(status code is 500 - it's realy on the server)
    return next(
      new AppError(
        'There was an error sending the email .Try again later',
        500,
      ),
    );
  }
});

//- IMPORTANT - POSTMAN: ADD THE JS SCRIPT FOR THE resetPassowrd - since it accepts a token in the URL!
//SINCE THE END POINT FOR THIE HANDLER : resetPassword - generetes a JWT token(in this function)
exports.resetPassword = async (req, res, next) => {
  //1)Get the user based on the reset token
  //QUERY THE DB BASED ON THE resetToken and if the passwordExpiration > CURRENTTIME
  //MONGOOSE : EASY WAY TO COMPOARE A GIVEN DATA TO THE CURRENT TIME(Mongoose will
  //convert the T.S for me in order to compoaret the values!)
  //NOTE - ONLY CHECKED ON THE USER - NOT NEED TO CHECK THE TOKEN
  //- BECAUSE THE USER QUIREIED BASED ON THIS ALSO
  //400 bad request
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log(`inside reset Password: resetToken from the request : `);
  console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    //NOTE: MongoDB will convert the t.s of right now to the same to be compoared
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  //2) Set the new password
  //NOTE: I will send the password and the passwordConfirmed via the body
  //DELETE THE RESET TOKEN AND THE EXPIRED TIME - FROM THE USER DOCUMENT
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3)Update the passwordChangedAt property for the user
  //4)Log in the client - by sending him the new JWT token in the response
  //LATER REFACTOR THIS CODE - IT REPEAT ITSELF IN 3 PLACES:singup , login , and now

  const token = signToken(user._id);
  res.status(201).json({
    status: 'success',
    token,
  });
};
