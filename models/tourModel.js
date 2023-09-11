const mongoose = require('mongoose');
const slugify = require('slugify');
// const Review = require('./reviewModel');
//I need to import only when embed the user into the tour
//const User = require('./userModel');

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
      //SETTER FUNCTION TO ROUND THE DECIMAL VALUE to x.y
      set: (val) => Math.round(val * 10) / 10,
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
    startLocation: {
      //Mongoose uses GeoJSON data format to specify GeoSpacial Data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //FOR THE EMBEDDED tours version - JUST DEMO
    //guides: Array,

    //REFERERNING! MAKE MORE SENSE THEN EMBEEDING
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    /**JUST FOR DEMO - IMPLEMENT CHILD REFERENICING
     *  - BUT I WILL TO IMPLEMENT VIRTUAL POPULATE - WHICH MAKES IT AS IF
     * I HAVE A REAL PHISICAL ARRAYOF ID OF THE REVIEWS CHILDS!(LIKE CHILD REFERENCING)
     *  */
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  //OPTIONS OBJECT
  {
    //Each time the data is outputed as a JSON - I want the V.P to be part of the output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//////////////
//INDEX
/////////////////
//SINGLE FIELD INDEX
// tourSchema.index({ price: 1 });
//COUMPUND FIELD INDEX(1 ascending , -1 descinging)
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });

//IMPORTANT : TELL MONGODB THAT THS STARLOCAION SHOULD BE INDEXED TO A 2D SPHERE!
tourSchema.index({ startLocation: '2dsphere' });
////////////////////////////////////////////////////////////////////////////////////////
//VIRTUAL PROPERTIES AND VIRTUAL POPULATE Will not be persisted in the DB - will be availbel
/////////////////////////////////////////////////////////////////////////////////////
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//VIRTUAL POPULATE
// tourSchema.virtual('reviews', {
//   ref: 'Review',
//   //IMPORTANT: this is the feild in the review which refere to this tour PUT ALL IN STINGS
//   foreignField: 'tour',
//   localField: '_id',
// });

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
////////////////////////////////////////////////////
//                DOCUMENT MIDDLEARES
///////////////////////////////////////////////////

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

//IMPORTANT:THIS EMBEEDDING APPROACH IS JUST FOR DEMO!
//PRE SAVE M.W - EACH TIME A NEW TOUR IS SAVED - Return the
//The guides is the input array ! of all the user ids
//loop over this array - and map each id to the corresponding user docuemnt

//NOTE - the arrow function makes an async call -wait -> must be declered with
//PROBLEM WITH THE BELOW CODE: The map method will assign the result of each iteration to the guides array -> it is an array of Promises!!
//=> I should run each promise at the same time!parallerl - BY SIMPLY add aftert  the guides decleration - await Promise.all(guides)
//const guidesPromises =  this.guides.map(async id =>await User.findById(id))
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));

//   //Store the returning values of the Promises in the guides array of this tour document!
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

///////////////////////////////////////
//QUERY MIDDLEWARE  - Processing Query - NOT DOCUMENT = >this referes to the current Query
// tourSchema.pre('find', function (next) {
/////////////////////////////////
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

//////////////////////
//REGULAR EXPRESSINO - TO APPLY THE LOGIN ON ALL findXXX - prevent code cuplication!

tourSchema.post(/^find/, function (docs, next) {
  //console.log(docs);
  // console.log(Date.now() - this.start);
  console.log(`Query took ${Date.now() - this.start}`);
  next();
});

//QUERY M.W - will be run each time a findXXX query is called:
//POPULATE THE TOUR WITH THE ACTUAL GUIDES DATA - and filter out the _v and the passwordChnagedAt of the user
tourSchema.pre(/^find/, function (next) {
  // console.log('----INSIDE PRE M.W ^find Query');
  this.populate({ path: 'guides', select: '-_v -passwordChangedAt' });
  next();
});

//SHOULD I DEFINE THIS FOR THE CHALLENGE?????????LEC 184
// tourSchema.pre(/^find/, function (next) {
//   // console.log('----INSIDE PRE M.W ^find Query');
//   this.populate({ path: 'reviews', select: '-_v -passwordChangedAt' });
//   next();
// });

//CHALLENGE !! LEC 184!
tourSchema.pre(/^find/, function (next) {
  // console.log('----INSIDE PRE M.W ^find Query');
  this.populate({ path: 'guides', select: '-_v -passwordChangedAt' });
  next();
});
///////////////////////////////////////
//Aggragtion Middleware - apply the filter of the secret tour on the request for statistics
// tourSchema.pre('aggregate', function (next) {
//   //Adding a new stage element to the begining  of the array
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
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
