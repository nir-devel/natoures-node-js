// NOT NEED IT HERE - IN THIS FILE I JUST WANT TO CONNECT TO THE DB
// const mongoose = require('mongoose');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
//console.log(`inside the server startup: DATABASE = ${process.env.DATABASE}`);
const app = require('./app');

console.log(
  `inside the server startup: PASSWORD = ${process.env.DATABASE_PASSWORD}`,
);

/*
connect to the mongodb using mongoose: 
  But first - replace the password section in the connection string  - using the process.env 
*/
// Get the connection string and replace thePASSWORD> with the real one in the DATABASE_PASSWORD e.v
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
    useUnifiedTopology: true,
  })
  // HANDLETHE PROIMSE - RESOLVED VALUE IS THE NEW CONNECTION
  .then(() => console.log('CONNECTION ESTABLIHSED!'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
// // Create the tourschema with mongoose(same data types as native JS)
// const tourSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'A tour must have a name'],
//     unique: true,
//   },
//   rating: {
//     type: Number,
//     default: 4.5,
//   },
//   price: {
//     type: Number,
//     required: [true, 'A tour must have a price'],
//   },
// });

// /**
//  * Create a tour model from the shcema
// MODELS NAMES VARIABLES - always start with capital - convention
// Models are used with the same JS ES6 CLASSES SYNTAX
// */
// const Tour = mongoose.model('Tour', tourSchema);

// // Create the tour document from the Tour model(document is an instance of the mdoel blue print)
// const testTour = new Tour({
//   name: 'The Snow Hiker',
//   rating: 4.7,
//   price: 497,
// });

// /**
//  * Save the testTour to the tours collection (return a Promise )
//  */
// testTour
//   .save()
//   .then((newTour) => console.log(newTour))
//   // Hanling the error
//   .catch((err) => console.error(`ERROR *: `, err));

// // CONNECT TO LOCAL - ERROR!!!!
// // mongoose
// //   .connect(process.env.DATABASE_LOCAL, {
// //     useNewUrlParser: true,
// //     useCreateIndex: true,
// //     useFindAndModify: false,
// //     useUnifiedTopology: true,
// //   })
// //   .then(() => console.log('CONNECTION ESTABLIHSED!'))
// //   .catch((err) => console.error(err));

// // TEST ESLINT WORKS FOR THE ERROR -OK - marked
// const x = 34;
// x = 22;
