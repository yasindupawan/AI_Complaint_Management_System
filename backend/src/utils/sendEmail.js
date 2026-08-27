const nodemailer = require("nodemailer");

/* =========================================================
   CREATE EMAIL TRANSPORTER
========================================================= */

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================================================
   SEND EMAIL
========================================================= */

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM || "Public Complaint Management System"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
      `Email sent successfully to ${to}`
    );

    return info;
  } catch (error) {
    console.error(
      "Email sending failed:",
      error.message
    );

    throw error;
  }
};

module.exports = sendEmail;