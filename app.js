const express = require('express');
const app = express();
const fs = require('fs');

//Read the array of all  tours object into a JSONString and then convert it to JSON objet-  sync (top level code)
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

const port = 3000;

app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    //ES6 - tours only tours property - the value will be resolved
    .json({ status: 'success', results: tours.length, data: { tours } });
});
//cb will be called on start lisening event
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

app.get('/api/v1/tours/:id', (req, res) => {
  //read the id from the url
  const id = req.params.id;

  //Check if id is valid :solution 1
  //   if (id > tours.length)
  //     return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  //Find the tour in the tours array with this id(must convert the req.params.id to numbe from string)
  const tour = tours.find((tour) => tour.id === req.params.id * 1);

  //Check if id is valid - solution 2:
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  // const t = tours.find((tour) => tour.id === +req.params.id);

  res.status(200).json({
    message: 'success',
    data: { tour },
  });
  console.log(tour.name);
});
//cb will be called on start lisening event

/**Middle ware to put the request body on the Request object
 * without it - the req.body is undefined!
 */
app.use(express.json());

app.post('/api/v1/tours', (req, res) => {
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
});

//Patch - accept partial tour object and update
app.patch('/api/v1/tours/:id', (req, res) => {
  console.log(req.params.id);
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({
    status: 'success',
    data: {
      tour: 'TOUR UPDATED HERE',
    },
  });
});
