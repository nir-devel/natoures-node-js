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
      type: mongoose.Schema.objectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },

    user: {
      type: mongoose.Schema.objectId,
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

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
