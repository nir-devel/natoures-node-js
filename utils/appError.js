class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;

    /*IMPORTANT: this property is derived from the statusCode
     convert statusCode to String with ``
     if statusCode is defined AND starts with 4 - then 'fail' 
     else 'error'
     */
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    //All instances of this class will be created by OPERATIONL ERRORS
    this.isOperational = true;

    /*PRESEVE THE STACK TRACE AND NOT ADDING GHIS CLASS TO THE STACK TRACEE
     Pass it the current instance and the Constructor function(this class)
    */

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
