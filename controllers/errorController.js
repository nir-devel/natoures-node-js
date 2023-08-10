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
    sendErrorProd(err, res);
  }
};

////////////////////////////////////////////////
//HELPER CLASS - PRIVATE TO THIS MOUDLE
const sendErrorDev = (err, res) => {
  console.log(`Inside sendErrorDev - mod: ${process.env.NODE_ENV}`);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/** 
 * PROD ENVIRONMENT - MOST IMPORTANT
 * IF  - OPERATIONAL err.isPerational :
     err is an  instance of my AppError class 
     and I created it already with correct status and message

  ELSE: it is a bug in my code or 3 party library 
    Send few messages - and 500 status code


 */
const sendErrorProd = (err, res) => {
  console.log(`Inside sendErrorProd - mod: ${process.env.NODE_ENV}`);

  if (err.isOperational) {
    console.log(`isOperation = ${err.isOperational}`);
    //Operational Errors: tursted error: send message to the client
    res.status(err.statusCode).json({
      status: err.status,
      //error: err,
      message: err.message,
      //stack: err.stack,
    });
    //Programming or other unknown error: Dont leadk error details to the client!
    //But for me - developer - log the error to the console
  } else {
    console.log(`isOperational = ${err.isOperational}`);
    ///LOG THE ERROR
    console.error('ERROR * *', err);

    //SEND GENERIC MESSAGE TO THE CLIENT(few details - it's my bug error) - UNKNOW ERRORS- Can not fix
    res
      .status(500)
      .json({ status: 'error', message: 'Something went very wrong' });
  }
};
