// const promisify = require('util').promisify;
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');

const AppError = require('./../utils/appError');
const { decode } = require('punycode');

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
// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     // roles ['admin', 'lead-guide']. role='user'
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError('You do not have permission to perform this action', 403),
//       );
//     }

//     next();
//   };
// };
