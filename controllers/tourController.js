//const fs = require('fs');
//Controller depend on my  Model module
const Tour = require('./../models/tourModel');
// console.log(Tour);

// OK
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });

  next();
};

//WRONG - NO ID PARAM IN THE URL OF THE POST REQUEST!
// exports.checkBody = (req, res, next, val) => {
//   console.log(`inside checkID: body = ${val}`);
//   console.log(req.body);
//   if (!req.body.name || !body.req.price)
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Tour must have name and price values',
//     });

//   next();
// };

//ROUTES
exports.getAllTours = async (req, res) => {
  // const requestedAt = Date.now().toString();
  try {
    const tours = await Tour.find();
    res
      .status(200)
      .json({ status: 'success', results: tours.length, data: { tours } });
  } catch (err) {
    res.status(404).json({ status: 'failed', message: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    //Read the id from the Route and call the Tour.findById
    //findById() - shortend to the Mongo syntax to findOne + find(filter)
    //I COULD WRITE THIS as Tour.findOne({_id: req.params.id})
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
    console.log(tour);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
  //read the id from the url(NOTE: The end point in the controlRoute was
  //defined as /api/v1/tours/:id )
  //EXTRACTED
  // if (req.params.id * 1 > tours.length)
  //   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  //const tour = tours.find((tour) => tour.id === req.params.id * 1);
  //Check if id is valid - solution 2:
  // if (!tour)
  //   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  // const t = tours.find((tour) => tour.id === +req.params.id);
  // console.log(tour.name);
};

exports.createTour = async (req, res) => {
  // console.log(`inside the createTour handler!!`);

  try {
    //Create a new tour documentusing the Tour Model API
    //(instead of the Document API - in which I need to first create a Documnet instance )
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.error('* * ERROR- TourController', err);
    //SEND MEANINGFUL ERROR MESSAGE TO THE CLIENT
    res.status(400).json({ status: 'failed', message: 'Invlaid data sent' });

    // res.status(400).json({ status: 'failed', message: err });
  }
};

exports.updateTour = (req, res) => {
  console.log(req.params.id);
  //EXTRACT THIS CODE INTO THE checkID() on top
  // if (req.params.id * 1 > tours.length)
  //   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(201).json({
    status: 'success',
    data: {
      tour: 'TOUR UPDATED HERE',
    },
  });
};

exports.deleteTour = (req, res) => {
  //EXTRACTED
  // if (req.params.id * 1 > tours.length)
  //   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  //SEND MEANINGFULL MESSAGE
  res.status(204).json({ status: 'success', data: null });
};
