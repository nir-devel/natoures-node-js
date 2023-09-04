const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log('------------INSIDE deleteOne - Model : ');
    console.log(Model);
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

//FACTORY FUNCTION(ARROW FUNCTION) RETURNS IMPLICLTY THE EXPRESSION AFTER THE => - WHICH IS A FUNCTION VALUE
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //Read the id from url , find the tour , update the tour

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      //Returns the updated document
      new: true,
      //The Mongoose API will handle it !Not me in the catch!
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No Document found with that ID', 404));
    }

    //set the response body with the updated tour
    res.status(200).json({
      status: 'success',
      //THE ENVELOPE IF THE FIRST DATA
      data: {
        data: doc,
      },
    });

    //res.status(404).json({ status: 'fail', message: err.message });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    //BUSINESS LOGIC ONLY - NOT ERROR HANDLING!
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//NOTE: THIS ONE IS A BIT TRICKER SINCE THE getTour()
// has populate - So pass popOptions as a second paramater!
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);

    const doc = await query;
    // const doc = await Tour.findById(req.params.id).populate('reviews');

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({ status: 'success', data: { data: doc } });
  });

//THIS FACTORY CONTAINS ALL THE API FEATURES - SO ALL THE RESOURCES WILL HAVE THIS COMPLETE FUNCTINOALITY
//IMPORTANT: SINCE THE getAllReviews has the code to read the id from the request - I MUST HANDLE IT IN THE FACTORY!
//SIMPLY BY COPYING THIS CODE INTO IT!
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //TO ALLOW FOR NESTED GET REVIEWS ON TOUR!!!!
    //FOR THE getALLReviews() handler - that need the code to check if there is an id in the URL params
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // const requestedAt = Date.now().toString();

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //The features.query has the find method on it
    //EXECUTING THE QUERY
    //NOTE - THE EXPLAINED() METHOD - TO GET STATISTCS WITH THE RESPONSE!
    // const doc = await features.query.explain();
    const doc = await features.query;
    // const tours = await query;
    //MongoDB  filter object in the query with gte : {difficulty:'easy', duration:{$gte:4}}
    //SNED RESOPNSE
    res
      .status(200)
      .json({ status: 'success', results: doc.length, data: { data: doc } });
  });
