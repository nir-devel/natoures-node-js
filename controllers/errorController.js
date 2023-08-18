const AppError = require('./../utils/appError');

//NOTE ALL ERROR HANDLERS FUNCTIONS - WILL BE EXECUTED IN THE PRODUCTION NOT IN DEV

//////////////////////////////////
//JWT ERROR HANDLERS
///////////////////////////////////////////
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);
////////////////////////////////////////////////
//MONGOOSE ERRORS HANDLERS
///////////////////////////////////////
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// const sendErrorDev = (err, res) => {
//   console.log('inside sendErrorDev() - Dev productoin');
//   res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message,
//     stack: err.stack,
//   });
// };

// const sendErrorProd = (err, res) => {
//   console.log('inside sendErrorProd() - Production');
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       //error: err,
//       message: err.message,
//       //stack: err.stack,
//     });
//     //PROGRAMMING OR OTHER UNKNOWN ERRORS: DON'T LEAK ERROR DETAILS!
//   } else {
//     //Log it for myself - to the console
//     console.error('ERROR * * ', err);
//     //Programming errors or unkonwn error - SEND GENERERIC INFO TO THE USER - DONT LEAD DETAILS
//     res
//       .status(500)
//       .json({ status: 'error', message: 'Something went very wrong' });
//   }
// };

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

//GLOBAL ERROR HANDLING M.W OF THE APP! API SINGLE METHOD !!
module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  //USER ONE OF THE HANDLERS FUNCTIONS ON TOP - IN PRODUCTION - NOT IN DEV
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name, errmsg: err.errmsg };

    console.log(`INSIDE GLOBAL M.W: ERROR NAME:${error.name}`);
    /////////////////
    //MONGOOSE/MONGODB ERRORS
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    /////////////////
    //JWT ERRORS
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
