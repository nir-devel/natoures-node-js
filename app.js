//THIS APP.JS file usually used for middleware declerations - and mounting routeres on urls
//BUILT IN MODULES
// const fs = require('fs');
// const { create } = require('domain');
//MY OWN MODULES

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
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
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err);
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
});

//EXPRESS ERROR HANDLING MIDDLEWARE FUNCTION- 4 params
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({ status: err.status, message: err.message });

  // next(err);
});
module.exports = app;
