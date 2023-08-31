const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res
    .status(200)
    .json({ status: 'sucess', results: reviews.length, data: reviews });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //NOTE: fiedls which are not in the review schema will be ignored
  const newReview = await Review.create(req.body);
  // console.log('newReview :');
  // console.log(newReview);
  res.status(201).json({ status: 'seuccess', data: { review: newReview } });
});

/**
 * 
 * exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  //BUSINESS LOGIC ONLY - NOT ERROR HANDLING!
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
 */
// exports.createReview = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   //BUSINESS LOGIC ONLY - NOT ERROR HANDLING!
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
