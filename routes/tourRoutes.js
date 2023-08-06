const fs = require('fs');

const express = require('express');

const tourController = require(`./../controllers/tourController`);

const router = express.Router();

//NO NEED THIS AFTER REFACTORING TO MONGODB WHICH WILL HANDLE THE ID GENERATION AND VALIDATION!
//Param Middleware: TEST - BEFORE EXTRACTING THIS CB TO THE CONTROLLER checkID - OK
// router.param('id', (req, res, next, val) => {
//   console.log(`tourRoutes accepts url id: ${val}`);
//   next();
// });

//Extract the code above to the checkID method in the controller and pass it to router.param
//router.param('id', tourController.checkID);

///////////////IMPORTANT - ALIAS ROUTING
//CREATE A SPECIAL ROUTE FOR THE URL '/top-5-cheap'
///////////////////////
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

//Route to statistics
router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/')

  .get(tourController.getAllTours)
  // .post(tourController.checkBody, tourController.createTour);
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .delete(tourController.deleteTour)
  .patch(tourController.updateTour);

module.exports = router;

//DESTRUCTRING THE OBJECT - (OPTINAL)
// const {
//   getTour,
//   getAllTours,
//   deleteTour,
//   updateTour,
//   deleteTour,
// } = require(`./../controllers/tourController`);

//Read the array of all  tours object into a JSONString and then convert it to JSON objet-  sync (top level code)
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

// //ROUTES
// const getAllTours = (req, res) => {
//   console.log(`Inside getAllTours handler: request sent on ${req.requestTime}`);
//   res
//     .status(200)
//     //ES6 - tours only tours property - the value will be resolved
//     .json({
//       status: 'success',
//       requestedAt: req.requestTime,
//       results: tours.length,
//       data: { tours },
//     });
// };

// const getTour = (req, res) => {
//   //read the id from the url
//   const id = req.params.id;

//   //Check if id is valid :solution 1
//   //   if (id > tours.length)
//   //     return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

//   //Find the tour in the tours array with this id(must convert the req.params.id to numbe from string)
//   const tour = tours.find((tour) => tour.id === req.params.id * 1);

//   //Check if id is valid - solution 2:
//   if (!tour)
//     return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
//   // const t = tours.find((tour) => tour.id === +req.params.id);

//   res.status(200).json({
//     message: 'success',
//     data: { tour },
//   });
//   console.log(tour.name);
// };

// const createTour = (req, res) => {
//   //Generate the id(The id is part of the API STATE?)
//   const newId = tours[tours.length - 1].id + 1;

//   //Create the new tour by merging the id with the req.bod
//   const newTour = Object.assign({ id: newId }, req.body);

//   //Update the STATE - add the new tour to the tours array
//   tours.push(newTour);

//   /*PERSIST THE NEW TOUR INTO THE FILE(ASYNC)
//         Before persisting the tours JSON object into the json file(text file)

//        -  Must Stringify it into a String format

//        - NOTE: Build the respone object inside the callback function which
//               will be executed as soon as the writing into the file completed

//               the data property of the response is the ENVELOP

//        */
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// };

// const updateTour = (req, res) => {
//   console.log(req.params.id);
//   if (req.params.id * 1 > tours.length)
//     return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: 'TOUR UPDATED HERE',
//     },
//   });
// };

// const deleteTour = (req, res) => {
//   res.status(204).json({ status: 'success', data: null });
// };
