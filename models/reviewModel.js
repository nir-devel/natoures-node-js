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

/*****************
 * INDEXES
 ************************/
//MAKE EACH COMBINATION OF TOUR AND USER - QUNIQUE(TO PREVENT A USER TO REVIEW THE SAME TOUR MORE THAN ONCE!)
reviewShcema.index({ tour: 1, user: 1 }, { unique: true });

/**
 * ----------------Query M.w --------------------
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
  //THIS CODE SHOULD BE EXECUTED ONLY IF THERE ARE REVIEWS - Otherwise the stats array is empty - and I will get an error for accesign it
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewShcema.post('save', function () {
  //this points to current review DOCUMENT- BUT I NEED

  this.constructor.calcAverageRatings(this.tour);
  // next();
});

//M.W HOOK
/**EXPLANATION:review :
       findByIdAndUpdate - is only a SHORTHAND FOR findOneAndUdate - with the current Id!
       The goal is to get access to the current document 
       But the this keyword in this hook - again - refers to the Query object!

       To go around this - EXECUTE THE QUERY - WHICH WILL GIVE ME THE DOCUMENT(the id) 
       That's currently being processd! - which is what I need to update the ratingAverage of the tour
 */
reviewShcema.pre(/^findOneAnd/, async function (next) {
  //GET ACCESS TO THE DOCUMENT BY EXECUTING THE QUERY AND RETURN THE DOCUMNT FROM DB
  //AND STORE IT ON THE CURRENT DOCUMENT
  this.r = await this.findOne();

  console.log(this.r);
  next();
});

//ONLY HERE I SHOULD CALCULATE THE AVG RAGING
//await this.findOne(); => DOES NOT WORK HERE , QUERY HAS ALREADY EXECUTED!!! THERE IS NO QUERY
reviewShcema.post(/^findOneAnd/, async function () {
  //GET THE TOUR OF THE RETURNED REVIEW FROM LAST PRE M.W WHICH IS STORED ON this.r.tour!
  //AND CALCUALTE THE ratingAverage ONLY AFTER IT WAS STORED(this is the right place - POST m.w!)
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewShcema);
module.exports = Review;
