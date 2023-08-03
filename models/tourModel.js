const mongoose = require('mongoose');
// Create the tourschema with mongoose(same data types as native JS)
const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  //How many people at most in one tour
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },

  rating: {
    type: Number,
    default: 4.5,
  },

  //Later I will defene a set of values it can have: Easy, medium,,,
  difficulty: {
    type: String,
    rquired: [true, 'A tour must have a diffculty'],
  },

  ratingAverage: {
    type: Number,
    default: 0,
  },

  ratingQuantity: {
    type: Number,
    default: 0,
  },

  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },

  priceDiscount: Number,

  //Required - since on the overview.html page!
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
  },
  //Not required
  description: {
    type: String,
    trim: true,
  },

  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },

  //Array of String type
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
});

/**
   * Create a tour model from the shcema
  MODELS NAMES VARIABLES - always start with capital - convention
  Models are used with the same JS ES6 CLASSES SYNTAX
  */
const Tour = mongoose.model('Tour', tourSchema);

// DEFAULT EXPORT OF NODE MODULES(SINGLE ITEM):
module.exports = Tour;
