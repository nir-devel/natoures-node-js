const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

//must add next() to make the catchAsync works!
exports.getOverview = catchAsync(async (req, res, next) => {
  //1 Get all tours data from the collection in db
  const tours = await Tour.find();

  // 2 Build template(not here in the controller)

  // 3 Render that tempalte using the tour data from 1)
  res.status(200).render('overview', { title: 'All Tours', tours });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

//CHALLENGE!!!!
// exports.getTour = catchAsync(async (req, res) => {
//   //1) Get the data, for the request tour(inlcuding reviews(IMPLEMENTEED ALREADY - POPULATED)
//   // => I NEED TO POPULATE THE REVIEWS IN THE TOUR DATA IN THE MODEL)
//   // const slug = req.params.slug;

//   // console.log(`SLUG FROM REQUEST PARAM: ${slug}`);

//   //IN THE CHALLENGE I USED THE find!- he used the findOne
//   // const tour = await Tour.find({ slug });

//   //HIS SOLUTION: Populate the tour with the reviews and guides HERE!
//   const tour = await Tour.findOne({ slug: req.params.slug }).populate({
//     path: 'reviews',
//     fields: 'review rating user',
//   });

//   console.log(`The tour from DB: ${tour}`);
//   //CHALLENGE - PASS THE tour  document FROM  DB  to the template as 'locale'
//   res.status(200).render('tour', { title: 'The Forest Hiker Tour' }, tour);
// });
