// const fs = require('fs');
const userController = require(`./../controllers/userController`);

const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');

//THE ONLY ENDPOINTS THAT ARE PUBLIC ARE IN THE FOLLOWING 4 M.W (router is a m.w)!
//CLIENT END POINTS - AUTHENTICATION
router.post('/signup', authController.signup);
router.post('/login', authController.login);

//FORGOT PASSWORD AND RESET
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

/////////FROM NOW ON - ALL ENDPOINTS ARE PORTECTED : CREATE A M.W TO PROTECT WHICH WILL TAKE EFFECT FOR ALL OTHER M.W
router.use(authController.protect);
////////////////////////////////////////////////////////////////
// router.post('/forget', authController.forgotPassword);
// router.post('/resetPassword', authController.resetPassword);

//meaningfull name: updateMyPassword - since this is an authenticated user
//Protected route
//- > THE LOGGED IN USER WILL BE SET ON THE REQUEST BY THE PROTECT METHOD: req.body.user!!!
router.patch('/updateMyPassword', authController.updatePassword);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

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

  userController.getMe,
  userController.getUser,
);

///////////////////////////////////////
//FROM NOW ON - ALL THE ENDPOINTS ARE RESTRICTED TO ADMIN ONLY
////////////////////////
router.use(authController.restrictTo('admin'));

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
