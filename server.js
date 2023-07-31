const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// // TEST ESLINT WORKS FOR THE ERROR -OK - marked
// const x = 34;
// x = 22;
