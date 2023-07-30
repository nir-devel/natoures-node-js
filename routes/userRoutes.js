// const fs = require('fs');
const userController = require(`./../controllers/userController`);

const express = require('express');
// const express = require('express');
// const getAllUsers = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route is not yet defined' });
// };

// const getUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route is not yet defined' });
// };

// const createUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route is not yet defined' });
// };

// const updateUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route is not yet defined' });
// };

// const deleteUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route is not yet defined' });
// };

const router = express.Router();

router.param('id', (req, res, next, val) => {
  console.log(`inside userRouter - id recieved: ${val}`);
  next();
});

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
