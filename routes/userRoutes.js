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

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

//ADMIN END POINTS
router.param('id', (req, res, next, val) => {
  console.log(`inside userRouter - id recieved: ${val}`);
  next();
});

//NOTE - getMe() handler-   required to be logged in and having the user id in the request params
//SO CALL THE M.W - - TO SET THE ID IN THE req.params.id - so I will be able to call the getOne factory() after !
//NOTE : the authController.protect will hadd the user to the current request
//ACTUALLY - FACKING THAT THE ID CAME FROM THE URL AND NOT FROM THE req.user.id!
//SINCE THE getOne() used the id from the URL!
router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
);
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
