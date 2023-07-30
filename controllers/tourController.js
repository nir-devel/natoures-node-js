const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

//Extract method : id validation
exports.checkID = (req, res, next, val) => {
  console.log(`inside checkID: id = ${val}`);
  console.log(req.params);
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  next();
};

//OK
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });

  next();
};

//WRONG - NO ID PARAM IN THE URL OF THE POST REQUEST!
// exports.checkBody = (req, res, next, val) => {
//   console.log(`inside checkID: body = ${val}`);
//   console.log(req.body);
//   if (!req.body.name || !body.req.price)
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Tour must have name and price values',
//     });

//   next();
// };

//ROUTES
exports.getAllTours = (req, res) => {
  console.log(`Inside getAllTours handler: request sent on ${req.requestTime}`);
  res
    .status(200)
    //ES6 - tours only tours property - the value will be resolved
    .json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: { tours },
    });
};

exports.getTour = (req, res) => {
  //read the id from the url
  const id = req.params.id;

  //EXTRACTED
  // if (req.params.id * 1 > tours.length)
  //   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  const tour = tours.find((tour) => tour.id === req.params.id * 1);

  //Check if id is valid - solution 2:
  // if (!tour)
  //   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  // const t = tours.find((tour) => tour.id === +req.params.id);

  res.status(200).json({
    message: 'success',
    data: { tour },
  });
  // console.log(tour.name);
};

exports.createTour = (req, res) => {
  //Generate the id(The id is part of the API STATE?)
  const newId = tours[tours.length - 1].id + 1;

  //Create the new tour by merging the id with the req.bod
  const newTour = Object.assign({ id: newId }, req.body);

  //Update the STATE - add the new tour to the tours array
  tours.push(newTour);

  /*PERSIST THE NEW TOUR INTO THE FILE(ASYNC)
          Before persisting the tours JSON object into the json file(text file)
         
         -  Must Stringify it into a String format
         
         - NOTE: Build the respone object inside the callback function which 
                will be executed as soon as the writing into the file completed
                
                the data property of the response is the ENVELOP
            
         */
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  console.log(req.params.id);
  //EXTRACT THIS CODE INTO THE checkID() on top
  // if (req.params.id * 1 > tours.length)
  //   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(201).json({
    status: 'success',
    data: {
      tour: 'TOUR UPDATED HERE',
    },
  });
};

exports.deleteTour = (req, res) => {
  //EXTRACTED
  // if (req.params.id * 1 > tours.length)
  //   return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  res.status(204).json({ status: 'success', data: null });
};
