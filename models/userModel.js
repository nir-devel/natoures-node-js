const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcryptjs');
const { JsonWebTokenError } = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },

  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  resetPasswordExpires: Date,
});

//Executeh this pre hook save middleware only when the user update the password or new user is created
userSchema.pre('save', async function (next) {
  //IF PASSWORD not changed or new user is created - then call to the next middleware - and return
  if (!this.isModified('password')) return next();

  //user update the password or new user is created - HASH THE PASSWORD
  //(using the bcrypt algorithm which salt and hash the password against the a brute force attack)
  //so 2 equals will not genereate the same hash - because of the salt(random string )
  //Second paramter - cost - CPU intensive
  //USE THE ASYNC VERSION - TO NOT BLOCK THE E.L
  this.password = await bcrypt.hash(this.password, 12);

  //DELETE THE passwordConfirm field(NOTE: the required is only on the input -it will not be in the DB )
  //THE RULE OF passwordConfirm is only for the validation process - between the events of calling create and the actual persist
  this.passwordConfirm = undefined;
  next();
});

/**
 *NOTE - I MUAST PSAS THE userPassword - since I disabled the select:false -> this.password is not availale in the db ouput
 * @param {*} candidatePassword : password in the request body(text-plain)
 * @param {*} userPassword: password found in the db - hashed already
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  //most of the documents will not have this proeprty defined (most of users dont change their passwd)
  if (this.passwordChangedAt) {
    console.log('PASSWORD CHANGED');
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(changedTimestamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimestamp;
  }

  //DEFAULT VALUE : user did not changed the passwd after the last login when the token was issued
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
