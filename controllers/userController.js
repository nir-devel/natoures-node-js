const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

const express = require('express');

//UTIL FUNCTION TO FILTER ONLY PROPERTIES I WANT TO UDPATED (ignore proeprties the client sent like roles etc.)
const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filteredObj[el] = obj[el];
  });

  return filteredObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user tries to update password data
  if (req.body.password || req.body.passwordConfirm)
    //NOTE BAD REQUEST - NOT 401!!
    //OK TESTED!:)
    return next(
      new AppError(
        'This route is not for password update. Please use /updatePassword',
        400,
      ),
    );

  //2) Filter out unwanted field names that are not allowd to by updated
  //NOTE: Dont pass the req.body!! since I dont want to update every thing in the req.body - LIKE roles!
  const fitleredBody = filterObj(req.body, 'name', 'email');
  console.log('filteredBody');
  console.log(fitleredBody);

  //3)Update the User docuemnet
  //NOTE: new:true - since I want to return the updated user ,
  // runValidators:true - so Mongoose will run the validators on name and eamil fileds

  ////////////////////////////////////////////////
  //IMPORTANT: TEST THE WRONG IMPLEMENTAION TO FIND USER BY ID , UPDATE PROPERTIES, AND THEN SAVE() USER
  //THIS WILL RETURN THE VALIDATION ERROR SINCE I DID NOT PROVIDE ALL REQUIRED FIELDS
  //NOTE: the id is embedded already in the req.user from protect(DONT PASS it again form postman in this route!)
  // const user = await User.findById(req.user.id);
  // user.name = 'Niron';
  // //WRONG!! Since there are more fields which are not saved!
  // await user.save();
  // console.log(`userController:updateMe() user found by id: ${user}`)
  ///////////////////////////////////////////////////

  //THE SOLUTION: THIS TIME I CAN USE THE findByIdAndUpdate() method - since there is no sensitive data!
  //2)Update the User docuemnet
  //Filter the body to updte only required fields: for now only email and name - without letting the user sends any data to be updated!

  const updatedUser = await User.findByIdAndUpdate(req.user.id, fitleredBody, {
    new: true,
    runValidators: true,
  });

  console.log('updated user after:');
  console.log(updatedUser);

  res.status(200).json({ status: 'success', updatedUser });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //NO NEED VALIDATORS SINCE NO USER INPUT IN THIS CASE
  const deletedUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  //204 -> IN POSTMAN I WILLNOT SEE THE RESPONSE! only status code
  res.status(204).json({ status: 'success' });
});

//FOR NOW - SINCE I TEST MY OWN!
// exports.getUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route is not yet defined' });
// };
exports.getUser = catchAsync(async (req, res, next) => {
  /*NOTE:findById() - Shorthand for findOne of Mongoose: 
      Tour.findOne({_id: req.param.id})
    */

  const user = await User.findById(req.params.id);
  //console.log(`Inside getTour() - found tour: ${tour}`);
  //HANDLE TOUR NOT FOUND(WITH VALID ID) by
  //creating my AppError , pass it to next, and return immedialty
  //THIS ERROR WILL BE MARKED AS OPERATOINAL BY THE AppError constructor!
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({ status: 'success', data: { user } });
  err;
  res.status(404).json({ status: 'fail', data: null });
});

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
