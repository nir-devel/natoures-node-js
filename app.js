//MY MODULES
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
//3rd modules
const express = require('express');
const morgan = require('morgan');
const app = express();

//////////////////
//ENV VARIALBES
// console.log(app.get('env'));
console.log(process.env.NODE_ENV);

//SETUP LOGIN TO DEV ONLY
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//OUTPUT :development
console.log(app.get('env'));
//////////////////////////////////////////////

app.use(morgan('dev'));

app.use(express.json());

//static content from the f.s
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   //console.log('INSIDE MY MIDDLEWARE');
//   next();
// });

//Middle ware that manipulate the request - write the current time to the request and response
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString().split('T')[0];
  //   console.log(req.requestTime);
  next();
});

/////////////////////////////////////////////////
//ROUTE HANDLERS
/////////////////////////////////
const port = 3000;
//Suppose this route handler wants to know the time the request send- and send it to the response

//MOUNTING ANE ROUTER(tourRouter) ON A ROUTE(/api/v1/users)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//IF I REACH HERE - THE REQUEST RESPONSE HAS NOT BEEN FINISHED -

//STEP 1 TO HANDLE UNHANDLED ROUTES

app.all('*', (req, res, next) => {
  /////////////////////
  //USE THE BUILT IN Error class
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  ////////////////
  //USE MY CUSTOM AppError
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
});

//EXPRESS ERROR HANDLING MIDDLEWARE FUNCTION- 4 params
//THIS ERROR HANDLING MIDDLEWARE WILL BE MOVED TO THE errorController file - where
//All the error handling functions of the app will be placed !
app.use(globalErrorHandler);
// app.use((err, req, res, next) => {
//   //DEMO OF err.stack
//   console.log(err.stack);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({ status: err.status, message: err.message });
// });
module.exports = app;
