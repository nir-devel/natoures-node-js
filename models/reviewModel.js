const mongoose = require('mongoose');
const Tour = require('./tourModel');
//SHCEMA FIELDS
// rating:Number
// createdAt:Date
// ref to tour on which this review belongs to
// ref to user that wrote this review
const reviewShcema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can notbe empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      //Required???
    },
    //SET THE DEFAULT TO Date.now()
    createdAt: {
      type: Date,
      default: Date.now,
    },

    //Parenet Refereing(see key notes of this lecture - easy)
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  //OPTIONS OBJECT
  {
    //VIRTUAL PROPERTIES: Will not be persisted in the DB - will be availbel
    //Each time the data is outputed as a JSON - I want the V.P to be part of the output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/** ----------------Query M.w --------------------
 *
 */

//Populate the review with userdata(name and photo) and tour data(tour name)
//TURN IT OFF - SINCE I LATER I IMPLEMENT VIRTUAL PUPLATING ON THE TOUR
//WHICH IS A BI-DIRECTIONAL - AND IT WILL RETURN HUGE AMOUT OF DATA ABOUT THE TOUR
//WHICH DOES NOT MAKES SENSE WHEN QUERY A TOUR DATA!

// reviewShcema.pre(/^find/, function (next) {
reviewShcema.pre(/^find/, function (next) {
  // this.populate({ path: 'user', select: 'name photo' }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  this.populate({ path: 'user', select: 'name photo' });

  next();
});

/////////////////////////////////////////////////////////
//STATIC FUNCTION (TRIGGER)
////////////////////////////////////

reviewShcema.statics.calcAverageRatings = async function (tourId) {
  //AGGRAGATE RETURNS A PROMISE
  const stats = await this.aggregate([
    //STAGE 1:MATHCH STAGE -  FIND THE TOUR WITH THIS ID
    {
      $match: { tour: tourId },
    },
    //STAGE 2:GROUP STAGE: CALCUALTE THE STATISTICS(first value is the common field I want to group all docs)
    {
      $group: {
        _id: '$tour',
        //ADD 1 TO EACH TOUR THAT WAS MATCHED IN THE MATCH STAGE
        nRating: { $sum: 1 },

        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  //UPDATE THE TOUR DOCUMENT WITH THE STATISTCS
  //NOTE: the stats are stored in an array of one object : I need to access the nRating and the avgRatings properties
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewShcema.post('save', function () {
  //this points to current review DOCUMENT- BUT I NEED

  this.constructor.calcAverageRatings(this.tour);
  // next();
});

//M.W HOOK

const Review = mongoose.model('Review', reviewShcema);
module.exports = Review;
