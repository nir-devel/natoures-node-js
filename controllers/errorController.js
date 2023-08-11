const sendErrorDev = (err, res) => {
  console.log('inside sendErrorDev() - Dev productoin');
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sentErrorProd = (err, res) => {
  console.log('inside sendErrorProd() - Dev Production');
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      //error: err,
      message: err.message,
      //stack: err.stack,
    });
  } else {
    //Log it for myself - to the console
    console.error('ERROR * * ', err);
    //Programming errors or unkonwn error - SEND GENERERIC INFO TO THE USER - DONT LEAD DETAILS
    res
      .status(500)
      .json({ status: 'error', message: 'Something went very wrong' });
  }
};
//API SINGLE METHOD !!
module.exports = (err, req, res, next) => {
  //DEMO OF err.stack
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //DEV ENVIRONMENTS - Send many messages!!logout the starck tracm , the error object,,,
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  //PROD - FEW
  else if (process.env.NODE_ENV === 'production') {
    sentErrorProd(err, res);
  }
};
