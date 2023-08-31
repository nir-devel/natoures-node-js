const express = require('express');

const reviewController = require(`./../controllers/reviewController`);
const authController = require('./../controllers/authController');
//const router = express.Router();
// MERGED PARAMS: ENABLE A ROUTER TO ACESS PARAMS OF ANOTHER ROUTER!
//ALL ROUTES OF THE FORM OF: /tour/tid123/review(this one is redirected by the tourRotues)
//s and /reviews - will be handled in the reviewController
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  //ONLY AUTHENTICATED USERS(role of 'user') CAN POST(not admins or tour guides)
  .post(
    authController.protect, //AUTHENTICATED
    authController.restrictTo('user'), //AUTHORIZATION : ONLY REGULAR USERS CAN POST
    reviewController.createReview,
  );

module.exports = router;
// const router = express.Router();
// router.route('/').post(reviewController.createReview);

// router.route('/');
//PLUGIN THE PROTECT MIDDLEWARE TO PROTECT THIS ROUTE
//
// .post(tourController.checkBody, tourController.createTour);
//   .post(reviewController.createReview);
