const mongoose = require('mongoose');
const slugify = require('slugify');
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
      // maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      //minlength: [10, 'A tour name must have more or equal then 10 characters'],
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
      // enum: {
      //   values: ['easy', 'medium', 'difficult'],
      //   message: 'Difficulty is either: easy, medium, difficult',
      // },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // min: [1, 'Rating must be above 1.0'],
      // max: [5, 'Rating must be below 5.0'],
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
  },
  //OPTIONS OBJECT
  {
    //Each time the data is outputed as a JSON - I want the V.P to be part of the output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/////////////////////////////////////
//VIRTUAL PROPERTIES: Will not be persisted in the DB - will be availbel
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

///////////////////////////////////////////
//DOCUMENT MIDDLEARE

// can be executed on the 'save' and 'create' BUT NOT ON THE insertMany, findByIDAndUpdate, etc...!!
//
tourSchema.pre('save', function (next) {
  //console.log('SAVED WAS CALLED... ABOUT THE PERSIST');
  //OK : print the current processed Document
  //console.log(this);
  this.slug = slugify(this.name, { lower: true });
  console.log(this);
  //SINCE I HAVE ANOTHER PRE HOOK - I MUST CALL NEXT!
  next();
});

//Second Middleware function on the same PRE HOOK(HOOK = 'save')
// tourSchema.pre('save', function (next) {
//   console.log('Will save document....');

//   next();
// });

// tourSchema.post('save', function (docs, next) {
//   // console.log('inside post middleware');
//   // console.log(docs);
//   //THIS IS THE LAST  HOOK IN THE MIDDLWARE STACK - I DONT HAVE TO CALL NEXT
//   //BUT GOOD PRACTIEC(the request is stuck ! but the tour has been persisted)
//   next();
// });

/**
   * Create a tour model from the shcema
  MODELS NAMES VARIABLES - always start with capital - convention
  Models are used with the same JS ES6 CLASSES SYNTAX
  */
const Tour = mongoose.model('Tour', tourSchema);

// DEFAULT EXPORT OF NODE MODULES(SINGLE ITEM):
module.exports = Tour;
