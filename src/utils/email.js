const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // creating a transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //   Define the email options

  const mailOptions = {
    from: 'favour tobiloba <favourtobiloba200@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  console.log(options);

  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
