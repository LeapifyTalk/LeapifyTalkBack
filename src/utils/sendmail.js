const nodemailer = require("nodemailer");
console.log(process.env.ENV);
require("dotenv").config();

const sendmail = async (msg) => {
  if (process.env.ENV === "development") {
    console.log("mail in development");

    let transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    let info = await transporter.sendMail(msg);
    console.log("message sent: ", info);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } else if (process.env.ENV === "production") {
    console.log("mail in production");
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    transporter.sendMail(msg, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
};

module.exports = sendmail;
