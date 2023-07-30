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

//////////////////////////////////////////////
//1.MIDDLEWARS
//////////////////////////////////////////////////
/**Middle ware to put the request body on the Request object
 * without it - the req.body is undefined!
 */
//tiny does not have the status code colored
// app.use(morgan('tiny'));
app.use(morgan('dev'));

app.use(express.json());

// //Read the array of all  tours object into a JSONString and then convert it to JSON objet-  sync (top level code)
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
// );

/**Create my own midleware - My cb will be called for each request
    Must call next - otherwise - the request stuck in the request-response cycle
    no respone will returend to client
 */

app.use((req, res, next) => {
  console.log('INSIDE MY MIDDLEWARE');
  next();
});

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

///////////////////////////////
//USERS HANDLERS

//USER HANDLERS FUNCTIONS

////////////////////////////////////////////
//ROUTES
///////////////////////////////////
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.delete('/api/v1/tours/:id', deleteTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.post('/api/v1/tours', createTour);
////////////MERGE urls /////////

//Connect the app  to the tourRouter(Middle) on the url api/v1/tours
//SUB APPLICATION:

// userRouter.route('/').get(getAllUsers).post(createUser);
// userRouter.route('/:id').get(getUser).delete(deleteUser).patch(updateUser);

//MOUNTING ANE ROUTER(tourRouter) ON A ROUTE(/api/v1/users)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
