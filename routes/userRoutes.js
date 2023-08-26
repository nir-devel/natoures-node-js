// const fs = require('fs');
const userController = require(`./../controllers/userController`);

const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');

//CLIENT END POINTS - AUTHENTICATION
router.post('/signup', authController.signup);
router.post('/login', authController.login);

//FORGOT PASSWORD AND RESET
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// router.post('/forget', authController.forgotPassword);
// router.post('/resetPassword', authController.resetPassword);

//meaningfull name: updateMyPassword - since this is an authenticated user
//Protected route
//- > THE LOGGED IN USER WILL BE SET ON THE REQUEST BY THE PROTECT METHOD: req.body.user!!!
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);

router.patch('/updateMe', authController.protect, userController.updateMe)
router.delete('/deleteMe',authController.protect, userController.deleteMe);


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
