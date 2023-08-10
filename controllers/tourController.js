//const fs = require('fs');
//Controller depend on my  Model module
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');
// console.log(Tour);

// OK
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price)
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });

//   next();
// };

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

/**My Middleware for Alias a demended URL
 * 
 * Essentially I build a request with a query params as if the user did this in POSTMAN
 * http://localhost:3000/api/v1/tours/top-5-cheap
 This middleware will be called by the tourRoutes when a request for /top-5-cheap' : 
 This function will prefill some req params before it will get 
 to the getAllTours
 NOTE: set to Strings!
 * 
 *
 */
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

//ROUTES

exports.getAllTours = catchAsync(async (req, res, next) => {
  // const requestedAt = Date.now().toString();
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  //The features.query has the find method on it
  //EXECUTING THE QUERY
  const tours = await features.query;
  // const tours = await query;
  //MongoDB  filter object in the query with gte : {difficulty:'easy', duration:{$gte:4}}
  //SNED RESOPNSE
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

exports.getTour = catchAsync(async (req, res, next) => {
  /*NOTE:findById() - Shorthand for findOne of Mongoose: 
      Tour.findOne({_id: req.param.id})
    */

  const tour = await Tour.findById(req.params.id);
  //console.log(`Inside getTour() - found tour: ${tour}`);
  //HANDLE TOUR NOT FOUND(WITH VALID ID) by
  //creating my AppError , pass it to next, and return immedialty
  //THIS ERROR WILL BE MARKED AS OPERATOINAL BY THE AppError constructor!
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({ status: 'success', data: { tour } });
  err;
  res.status(404).json({ status: 'fail', data: null });
});
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
//MOVE IT TO THE A MODULE IN THE UTILS.js
// const catchAsync = (fn) => {
//   //This return function - Express will call - when POST request hits the server
//   //ALL THE MAGIC - THIS IS WAHT ALLOWS ME TO REMOVE THE TRY-CATCH BOILERPLATE
//   //WRONG
//   //return (fn) => fn(req, res, next).catch(next);
//   return (req, res, next) => fn(req, res, next).catch(next);
// };

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  //BUSINESS LOGIC ONLY - NOT ERROR HANDLING!
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

//HOW TO HANDLE THE CASE WHEN THE ID NOT FOUND???
exports.updateTour = catchAsync(async (req, res, next) => {
  //Read the id from url , find the tour , update the tour
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    //Returns the updated document
    new: true,
    //The Mongoose API will handle it !Not me in the catch!
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  //set the response body with the updated tour
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });

  res.status(404).json({ status: 'fail', message: err.message });
});

//HOT TO HANDLE NOT FOUND?????????

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  //Dont send any response body to the client
  res.status(204).json({ status: 'success', data: null });
  res.status(404).json({ status: 'fail', message: err });
});

/////////////////////////////////////////
//AGGREGATE PIPELINE
exports.getTourStats = catchAsync(async (req, res, next) => {
  //MUST AWAIT - OTHERWISE I WILL GET THE JSON PIPELINE - BUT I WANT THE DAT OF THE PROMISE
  //Tour.aggregatge() return an Aggregate object , find() returns a Query object
  const stats = await Tour.aggregate([
    {
      //Just a query
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null,
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    //Here I have only the documents from the last stage => I have limited fields
    //Use 1 : for ascending
    // { $sort: { avgPrice: -1 } },
    { $sort: { avgPrice: 1 } },

    //REPEAT STAGES (repeat match stage) - After the group - just for demo - OK
    //The id is the difficulty! select all not easy tours
    // { $match: { _id: { $ne: 'EASY' } } },
  ]);
  //Send the response
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  try {
    //Get the year from the req.params
    const year = req.params.year * 1; //2021

    console.log(year);
    //Create
    //await
    const plan = await Tour.aggregate([
      //Define the  unwind stage - First Stage
      {
        /**
         * UNWIND will: Deconstructo an array field from the input documents and then output
         * one document for each element of the array!
         * this is what I want - one tour for each of one of the dates in the array
         */
        //The field with the array that I want to UNWIND is startDate
        $unwind: '$startDates',
      },
      {
        //Select the date which is greather then the January 1st of the current year
        //and less then or equal of the December 31st of the document year
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          //COUNT THE TOURS
          numTourStarts: { $sum: 1 },
          tours: { $push: `$name` },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        //Sort in desceinding order to get the busiest month on top
        $sort: { numTourStarts: -1 },
      },
      {
        //Like the limit in the Query ..
        //
        $limit: 12,
      },
    ]);

    res.status(200).json({ status: 'success', data: { plan } });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
});

//EXTRACTED
// if (req.params.id * 1 > tours.length)
//   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
//SEND MEANINGFULL MESSAGE
