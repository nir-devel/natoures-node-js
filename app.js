//BUILT IN MODULES
const fs = require('fs');
// const { create } = require('domain');
//MY OWN MODULES
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

//Read the array of all  tours object into a JSONString and then convert it to JSON objet-  sync (top level code)
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

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
const getAllTours = (req, res) => {
  console.log(`Inside getAllTours handler: request sent on ${req.requestTime}`);
  res
    .status(200)
    //ES6 - tours only tours property - the value will be resolved
    .json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: { tours },
    });
};

const getTour = (req, res) => {
  //read the id from the url
  const id = req.params.id;

  //Check if id is valid :solution 1
  //   if (id > tours.length)
  //     return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  //Find the tour in the tours array with this id(must convert the req.params.id to numbe from string)
  const tour = tours.find((tour) => tour.id === req.params.id * 1);

  //Check if id is valid - solution 2:
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  // const t = tours.find((tour) => tour.id === +req.params.id);

  res.status(200).json({
    message: 'success',
    data: { tour },
  });
  console.log(tour.name);
};

const createTour = (req, res) => {
  //Generate the id(The id is part of the API STATE?)
  const newId = tours[tours.length - 1].id + 1;

  //Create the new tour by merging the id with the req.bod
  const newTour = Object.assign({ id: newId }, req.body);

  //Update the STATE - add the new tour to the tours array
  tours.push(newTour);

  /*PERSIST THE NEW TOUR INTO THE FILE(ASYNC)
      Before persisting the tours JSON object into the json file(text file)
     
     -  Must Stringify it into a String format
     
     - NOTE: Build the respone object inside the callback function which 
            will be executed as soon as the writing into the file completed
            
            the data property of the response is the ENVELOP
        
     */
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  console.log(req.params.id);
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(201).json({
    status: 'success',
    data: {
      tour: 'TOUR UPDATED HERE',
    },
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({ status: 'success', data: null });
};

///////////////////////////////
//USERS HANDLERS
const getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

const getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

const createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

const updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

const deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
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

//TOURS ROUTES
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .delete(deleteTour)
  .patch(updateTour);

//USERS ROUTES
app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .delete(deleteUser)
  .patch(updateUser);
///////////////////////////
//STARTS THE SERVER
///////////////////
//cb will be called on start lisening event
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
