//MY MODULES
const path = require('path');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewsRoutes');
//const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
//3rd modules
const express = require('express');
const morgan = require('morgan');
const app = express();

//Pug Template Setup to be used in Express - AND STATIC FILES
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
////////SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//IMPLEMENTING CORS
const cors = require('cors');
app.use(cors());

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const hpp = require('hpp');

///////////////LIMIT REQUESTS FROM SAME IP//////////////////
//Create a limiter from the express-rate-limit - by passing it's factory an options object
//max 100 request per hour
//NOTE: each appliation needs different limiter - think before it
//PASS THE RETURNED  VALUE(m.w function) OF THE rateLimit function object: M.W FUNCTION to the app.use() function and specify
//the route I want to apply this m.w - manually on the /api - to effect all the routes starts with /api - all routes!
const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in a hour',
});
app.use('/api', limiter);

//////////BODY PARSER: Reading data from the request body into req.body
//LIMIT AMOUT OF DATA COMMING FROM PAYLOAD
app.use(express.json({ limit: '10mb' }));
// app.use(express.json());

//DATA SANITZATION AGAINST NoSQL query injection attack
//(The mongoSanitize() m.w - filter out all $ and dot from the request body , query string, and params )
app.use(mongoSanitize());

//DATA SANITZATION AGAINST NoSQL query injection attack
app.use(xss());

//PROTECT AGAINST PARAMTER POLUTION(like when sending 2 sort parameters to GET /tours )
//NOTE: This m.w should be at the end - to clear up the query string !
//White list: array for values I allow dupliaction!
//
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
//HELOMET global m.w - for adding importnat secure headers!!
app.use(helmet());

//////////////////
//ENV VARIALBES
// console.log(app.get('env'));
// console.log(process.env.NODE_ENV);

// //SETUP LOGIN TO DEV ONLY
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//OUTPUT :development
console.log(app.get('env'));
//////////////////////////////////////////////

app.use(morgan('dev'));

/////TEST M.W
//Middle ware that manipulate the request - write the current time to the request and response
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString().split('T')[0];
  //   console.log(req.requestTime);
  next();
});

//////////////////////////////////
//ROUTES
////////////////////////////////////
//const port = 3000;
//Suppose this route handler wants to know the time the request send- and send it to the response

//MOUNTING THE Router  FOR THE VIEWS:(right on the root URL)
app.use('/', viewRouter);
//MOUNTING  Routers for the RESOURCES- which are M.W!! ON A ROUTE(/api/v1/users)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
// app.use('/api/v1/reviews', reviewRouter);
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
