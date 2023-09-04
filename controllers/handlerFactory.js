const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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
