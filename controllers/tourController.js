//const fs = require('fs');
//Controller depend on my  Model module
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
//IT IS NEEDED HERE OLNY FOR THE GEOSPATICAL REQUESTS - ALL OTHER METHODS MOVED TO THE FACTORY !
const AppError = require('../utils/appError');

const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

//IMPORTANT - PASS THE popOptions object to the factory - to populate the tour with it's reviews childs
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);
//IMPORTANT - the updateTour
//DO NOT UPDATE PASSWORD WITH THIS(WILL NOT WORK - SINCE PRE SAVE M.W
// - WILL NOT RUN since they call the findByIdAndUpdate())
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// //HOW TO HANDLE THE CASE WHEN THE ID NOT FOUND???
// exports.updateTour = catchAsync(async (req, res, next) => {
//   //Read the id from url , find the tour , update the tour
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     //Returns the updated document
//     new: true,
//     //The Mongoose API will handle it !Not me in the catch!
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   //set the response body with the updated tour
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });

//   //res.status(404).json({ status: 'fail', message: err.message });
// });

//AFTER REFACTORING - DELETE - TO FACTORY

//HOT TO HANDLE NOT FOUND?????????
//REFACTORED TO handlerFactory genereic
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
//   //Dont send any response body to the client
//   // res.status(204).json({ status: 'success', data: null });
//   // res.status(404).json({ status: 'fail', message: err });
// });

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

//LOS ANGELERS FROM GOOGLE MAP:34.127329, -118.199117
//tours-within/:distance/center/:latlng/unit/:unit
//tours-within/233/center/-40,45/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  //destruct the request.params object to get all the properties at once
  const { distance, latlng, unit } = req.params;

  //Create an array of [lag,lng] from the latlng variable
  // - and destructt the array - to get the lat , lng at once
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitute or longtitude in the format lat,lng',
        400,
      ),
    );
  }

  console.log(distance, lat, lng, unit, radius);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  //convrt the results(meters) to either mi or km(since meters is not readable)
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitute or longtitude in the format lat,lng',
        400,
      ),
    );
  }

  //PART 2 : CALCUALTION WITH AGGRAGATOIN PIPELINE- USING THE geoNear Stage
  const distances = await Tour.aggregate([
    //$geoNear - Must be the FIRST STAGE IN THE PIPELINE
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        //NOTE: in the geoNear stage: I can easily convert the meters to km
        // by specify  the  distancMultiplier property !
        distanceMultiplier: multiplier,
      },
    },
    //SECDON STAGE: PROJECT - return only the name and the distnace(from first stage)
    {
      $project: {
        //KEEP THE DISTANCE and tour by setting to 1
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

//EXTRACTED
// if (req.params.id * 1 > tours.length)
//   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
//SEND MEANINGFULL MESSAGE
