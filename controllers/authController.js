const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');

const AppError = require('./../utils/appError');

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
  });

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
