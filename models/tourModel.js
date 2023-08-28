const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour name must have less or equal  than 40 characters',
      ],
      minLength: [
        10,
        'A tour name must have more or equal  than 10 characters',
      ],
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
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation:{
      //Mongoose uses GeoJSON data format to specify GeoSpacial Data
      type:{
        type:String, 
        default:'Point', 
        enum:['Point']

      }, 
      coordinates:[Number],
      address:String, 
      description:String
    },
    locations:[
      {
        type:{
          type:String, 
          default:'Point', 
          enum:['Point']
        },
        coordinates:[Number],
        address:String, 
        description:String, 
        day:Number
      },
    ]
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
  // console.log(this);
  //SINCE I HAVE ANOTHER PRE HOOK - I MUST CALL NEXT!
  next();
});

///////////////////////////////////////
//QUERY MIDDLEWARE  - Processing Query - NOT DOCUMENT = >this referes to the current Query
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  //Select all tours with secretTour is false
  this.find({ secretTour: { $ne: true } });
  //set the start property on the file on the Query object
  //In m.s
  this.start = Date.now();
  //OK - RETURNS ONE TOUR WITH SECRET TOUR ture
  //this.find({ secretTour: true });
  //console.log(tours);
  next();
});

/////////////////////////
//REGULAR EXPRESSINO - TO APPLY THE LOGIN ON ALL findXXX - prevent code cuplication!

tourSchema.post(/^find/, function (docs, next) {
  //console.log(docs);
  console.log(Date.now() - this.start);
  next();
});

///////////////////////////////////////
//Aggragtion Middleware - apply the filter of the secret tour on the request for statistics
tourSchema.pre('aggregate', function (next) {
  //Adding a new stage element to the begining  of the array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

/**
   * Create a tour model from the shcema
  MODELS NAMES VARIABLES - always start with capital - convention
  Models are used with the same JS ES6 CLASSES SYNTAX
  */
const Tour = mongoose.model('Tour', tourSchema);

// DEFAULT EXPORT OF NODE MODULES(SINGLE ITEM):
module.exports = Tour;

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
