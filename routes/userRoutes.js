// const fs = require('fs');
const userController = require(`./../controllers/userController`);

const express = require('express');

const router = express.Router();
const authController = require('./../controllers/authController');
//CLIENT END POINTS - AUTHENTICATION
router.post('/signup', authController.signup);

router.post('/login', authController.login);

//ADMIN END POINTS
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
