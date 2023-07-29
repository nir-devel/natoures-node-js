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
