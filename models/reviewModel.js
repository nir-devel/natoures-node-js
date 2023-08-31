const mongoose = require('mongoose');

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

reviewShcema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' }).populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

const Review = mongoose.model('Review', reviewShcema);
module.exports = Review;
