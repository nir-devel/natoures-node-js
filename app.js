const express = require('express');
const app = express();

//Route to the app url with GET
app.get('/', (req, res) => {
  //res.end('Hello from the root endpoint');
  //res.status(200).send('Hello from the server side');
  //JSEND - Enveloping the response format
  //When using json() the Content-Type is set automatically to application/json(I dont need manyally add the header)
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Hello From the Server side',
      app: 'Natours',
    },
  });
});

app.post('/', (req, res) => {
  res.status(200).send('You can post to the server');
});

const port = 3000;

//cb will be called on start lisening event
app.listen(3000, () => {
  console.log(`App running on port ${port}`);
});
