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

  console.log(tours);

  //WHAT IS WRONG??
  //JSON.parse(tour);
  //   const tourJSON = JSON.parse(tour);
  //   tours.add(tour);
  //Persist the req.body into the file
  //   fs.writeFileSync(`${__dirname}/dev-data/data`, tour, (err) => {
  //     console.error('Could not persist the tour');
  //   });
  //res.send('DONE');
});
