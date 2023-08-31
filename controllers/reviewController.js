const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res
    .status(200)
    .json({ status: 'sucess', results: reviews.length, data: reviews });
});

exports.createReview = catchAsync(async (req, res, next) => {
  console.log(
    '---------inside createReview handler: the logged in user----------',
  );
  console.log(req.user);
  //NESTED ROUTE -
  //- LET THE USER MANUALLY SET THE tourId in the URL(in it is not already in the request body )
  //IF NO user in the request body - read it from the logged in user passed by the protect m.w
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

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
