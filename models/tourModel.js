const mongoose = require('mongoose');
// Create the tourschema with mongoose(same data types as native JS)
// const tourSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'A tour must have a name'],
//     unique: true,
//     trim: true,
//   },
//   duration: {
//     type: Number,
//     required: [true, 'A tour must have a duration'],
//   },
//   //How many people at most in one tour
//   maxGroupSize: {
//     type: Number,
//     required: [true, 'A tour must have a group size'],
//   },

//   rating: {
//     type: Number,
//     default: 4.5,
//   },

//   //Later I will defene a set of values it can have: Easy, medium,,,
//   difficulty: {
//     type: String,
//     rquired: [true, 'A tour must have a diffculty'],
//   },

//   ratingsAverage: {
//     type: Number,
//     default: 0,
//   },

//   ratingsQuantity: {
//     type: Number,
//     default: 0,
//   },

//   price: {
//     type: Number,
//     required: [true, 'A tour must have a price'],
//   },

//   priceDiscount: Number,

//   //Required - since on the overview.html page!
//   summary: {
//     type: String,
//     trim: true,
//     required: [true, 'A tour must have a summary'],
//   },
//   //Not required
//   description: {
//     type: String,
//     trim: true,
//   },

//   imageCover: {
//     type: String,
//     required: [true, 'A tour must have a cover image'],
//   },

//   //Array of String type
//   images: [String],
//   createdAt: {
//     type: Date,
//     default: Date.now(),
//     select: false,
//   },
//   startDates: [Date],
// });
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    // secretTour: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // },
);

/**
   * Create a tour model from the shcema
  MODELS NAMES VARIABLES - always start with capital - convention
  Models are used with the same JS ES6 CLASSES SYNTAX
  */
const Tour = mongoose.model('Tour', tourSchema);

// DEFAULT EXPORT OF NODE MODULES(SINGLE ITEM):
module.exports = Tour;
