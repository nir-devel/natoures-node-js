const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //LECTURE CODE: DOES NOT WORK CHECK BELOW CODE FROM Q.A
  // HE ADDED THE SECURE OPTION SET TO FALSE
  //1.Create a transporter service
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    //logger and secure  FROM Q.A - BUT WORKS WITHOUT
    //logger: true,
    //secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2.Defind the email options
  const mailOptions = {
    from: 'Nir <hello@nir.io>',
    //the options I passed to this function
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: true,
  };

  //3 Send the email using nodemail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
