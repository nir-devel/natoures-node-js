const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

/*
connect to the mongodb using mongoose: 
  But first - replace the password section in the connection string  - using the process.env 
*/
//Get the connection string and replace thePASSWORD> with the real one in the DATABASE_PASSWORD e.v
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// CONNECT TO THE HOSTED DB: RETUREN A PORIMSE! I need to handle it - OK !!

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  // HANDLETHE PROIMSE - RESOLVED VALUE IS THE NEW CONNECTION
  .then(() => console.log('CONNECTION ESTABLIHSED!'));

// Create the tourschema with mongoose(same data types as native JS)
const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

//Create a tour model from the shcema
//MODELS NAMES  VARIABLES - always start with capital - convention
//Models are used with the same JS ES6 CLASSES SYNTAX
const Tour = mongoose.model('Tour', tourSchema);

//Create the tour document from the Tour model
const testTour = new Tour({ name: 'The Forest Hiker', rating: 4.7, price: 97 });

//CONNECT TO LOCAL - ERROR!!!!
// mongoose
//   .connect(process.env.DATABASE_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log('CONNECTION ESTABLIHSED!'))
//   .catch((err) => console.error(err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// // TEST ESLINT WORKS FOR THE ERROR -OK - marked
// const x = 34;
// x = 22;
