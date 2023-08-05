//const fs = require('fs');
//Controller depend on my  Model module
const Tour = require('./../models/tourModel');
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
exports.getAllTours = async (req, res) => {
  // const requestedAt = Date.now().toString();
  try {
    console.log(`getAllTours(): req.query:`, req.query);
    //BUILD QUERY - CREATE A HARD COPY of the req.query (to prevent modification on the paramater) using ES6 : destructring the req.query into an object
    //1.A: FILTTERING
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1.B: ADVANCED FILTTERING
    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // let queryStr = JSON.stringify(queryObj);
    //console.log(`getAllTours(): queryStr after replace.query:${queryStr}`);

    // console.log(JSON.parse(queryStr)); //{ difficulty: { '$gte': '5' } } -> OK JSON OBJECT!!
    // console.log(queryStr); //{"difficulty":{"$gte":"5"}} - > OK STRING

    // console.log(JSON.parse(queryStr));
    //THE find method recieves an object - not a String
    let query = Tour.find(JSON.parse(queryStr));

    //FEATURE 2 - SROTING
    if (req.query.sort) {
      //console.log(req.query.sort); //OK price,duration
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy); // //OK price duration

      //CHAIN the sort functionality into the query
      query = query.sort(sortBy);
    }
    //Provide default sorting on the createdAt field in descending order - newest on top
    else {
      query.sort('-createdAt');
    }

    ///////////////////////////////////////////////////
    //Feature 3: Fields limiting - PROJECTING(Not if the user will pass a field with minus - the mongo will not search for it)
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      //update the query - add the select option
      console.log(fields);
      query = query.select(fields);
      //query =query.select('name duration ')
    }
    //exclude the __v of MONGOOSE - if the user did not specify it in the url
    else {
      query = query.select('-__v');
    }

    //////////////////////////////////////////
    //Feature  4 : Pagination
    //Mongoose Examle: query.skip(2).limit(10)
    //page=2&limit=10, 1-10,page1, 11-20, page2

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;

    //Calclulate the skip value
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    //Dont need this! I dont need to throw when the there are no results
    if (req.query.page) {
      const count = await Tour.countDocuments();
      console.log(`count = ${count}`);
      console.log(`skip = $${skip}`);

      if (skip >= count) throw new Error('Page does not exists');
    }
    //EXECUTE THE QUERY - with await
    const tours = await query;
    //MongoDB  filter object in the query with gte : {difficulty:'easy', duration:{$gte:4}}

    //SNED RESOPNSE
    res
      .status(200)
      .json({ status: 'success', results: tours.length, data: { tours } });
  } catch (err) {
    res.status(404).json({ status: 'failed', message: err });
  }
  // const tours = await Tour.find({ duration: 5, difficulty: 'easy' });
  // const tours = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');
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
