//const fs = require('fs');
//Controller depend on my  Model module
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
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

// class APIFeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//   }

//   filter() {
//     // const queryObj = { ...req.query };//BEFORE REFACTORING -THIS CODE WAS IN THE CONTROLLER //IMPORTANT !!  THIS IS BEFORE REFACTORING ! NOW THIS APIFeatures class has no access to req.query //Basic Filttering
//     const queryObj = { ...this.queryString };
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     excludedFields.forEach((el) => delete queryObj[el]);

//     // ADVANCED FILTTERING
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // let queryStr = JSON.stringify(queryObj);

//     /**IMPORTANT
//      * In this class - I am not depend on the Tour Resource - The Model is set already in the query property
//      *
//      * Remove this - this was before the refactoring - Now I am not depend on the Tour Resource
//      */
//     //BEFORE REFACTORING TO THIS CLASS
//     // let query = Tour.find(JSON.parse(queryStr));

//     //AFTER REFACTORING: update the this.query - add the find query
//     this.query = this.query.find(JSON.parse(queryStr));

//     //DONT RETURN THE QUERY !
//     //return this.query;
//     return this;
//   }

//   //Will be chain after the filter
//   sort() {
//     // if (req.query.sort) {
//     if (this.queryString.sort) {
//       //console.log(req.query.sort); //OK price,duration
//       const sortBy = this.queryString.sort.split(',').join(' ');
//       console.log(sortBy); // //OK price duration

//       //CHAIN the sort functionality into the query
//       this.query = this.query.sort(sortBy);
//     }
//     //Provide default sorting on the createdAt field in descending order - newest on top
//     else {
//       this.query.sort('-createdAt');
//     }

//     return this;
//   }

//   limitFields() {
//     // if (req.query.fields) {
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(',').join(' ');
//       //update the query - add the select option
//       console.log(fields);
//       //query = query.select(fields);
//       this.query = this.query.select(fields);

//       //query =query.select('name duration ')
//     }
//     //exclude the __v of MONGOOSE - if the user did not specify it in the url
//     else {
//       // query = query.select('-__v');
//       this.query = this.query.select('-__v');
//     }

//     return this;
//   }

//   paginate() {
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 100;

//     //Calclulate the skip value
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);

//     return this;
//     //Dont need this! I dont need to throw when the there are no results
//     // if (req.query.page) {
//     //   const count = await Tour.countDocuments();
//     //   console.log(`count = ${count}`);
//     //   console.log(`skip = $${skip}`);

//     //   if (skip >= count) throw new Error('Page does not exists');
//   }
// }

//ROUTES
exports.getAllTours = async (req, res) => {
  // const requestedAt = Date.now().toString();
  try {
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

/////////////////////////////////////////
//AGGREGATE PIPELINE
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
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
};

//EXTRACTED
// if (req.params.id * 1 > tours.length)
//   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
//SEND MEANINGFULL MESSAGE
