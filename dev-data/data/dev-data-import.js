//I need it here to read credentials to connect to DB
const mongoose = require('mongoose');
//I need the E.V in order to be able connect to DB
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
//To READ THE JSON FILE
const fs = require('fs');
///I NEED THE MODEL TO WRITE THE DATA INOT
const Tour = require('./../../models/tourModel');

console.log(process.env.DATABASE);
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
  })
  // HANDLETHE PROIMSE - RESOLVED VALUE IS THE NEW CONNECTION
  .then(() => console.log('CONNECTION ESTABLIHSED!'));

const tours = JSON.parse(
  ///The '.' is relative to the folder on which the node appliaction starts - the home folder
  //I need to use the __dirname - which availabe anywhere(if I use it then it will be the current folder- What I want!)
  //fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
  //IMPORT THE COMPLETE DATA
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'),


);
//IMPORT DATA INTO DB
const importData = async function () {
  try {
    //Pass an array of tours
    await Tour.create(tours);

    console.log('Data succesfully loaded');
    // process.exit();
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

//DELETEING ALL DATA FROM DB - use the deleteMany function
const deleteData = async function () {
  try {
    //Mongoose - Layer of abstraction over Native MongoDB
    await Tour.deleteMany();
    console.log('All tours Data have been deleted from DB');
    // process.exit();
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

console.log('CONNECTED  TO DB FROM dev-data-import.js');
console.log(process.argv);
/*

Nir19@DESKTOP-CAGNIFL MINGW64 /c/MyStudies/Udemy/Node/Natours (devel)
$ node dev-data/data/dev-data-import.js --import
mongodb+srv://nir:<PASSWORD>@cluster0.kituww3.mongodb.net/natours?retryWrites=true&w=majority
CONNECTED  TO DB FROM dev-data-import.js
[
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\MyStudies\\Udemy\\Node\\Natours\\dev-data\\data\\dev-data-import.js',
  '--import'
]
*/
if (process.argv[2] === '--import') {
  importData();

  console.log(`dev-data-imort.js - Data imported from F.S into  the database!`);
} else if (process.argv[2] === '--delete') {
  deleteData();
  console.log(`dev-data-imort.js - Data Deleted from in  database!`);
}
