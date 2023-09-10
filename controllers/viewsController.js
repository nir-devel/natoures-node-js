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

exports.getTour = (req, res) => {
  res.status(200).render('tour', { title: 'The Forest Hiker Tour' });
};
