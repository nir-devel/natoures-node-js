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
    /*NOTE:findById() - Shorthand for findOne of Mongoose: 
      Tour.findOne({_id: req.param.id})
    */
    const tour = await Tour.findById(req.params.id);
    //console.log(`Inside getTour() - found tour: ${tour}`);
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(404).json({ status: 'fail', data: null });
  }
};
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

//HOW TO HANDLE THE CASE WHEN THE ID NOT FOUND???
exports.updateTour = async (req, res) => {
  try {
    //Read the id from url , find the tour , update the tour
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      //Returns the updated document
      new: true,
      //The Mongoose API will handle it !Not me in the catch!
      runValidators: true,
    });

    //set the response body with the updated tour
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

//HOT TO HANDLE NOT FOUND?????????

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    //Dont send any response body to the client
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};
//EXTRACTED
// if (req.params.id * 1 > tours.length)
//   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
//SEND MEANINGFULL MESSAGE
