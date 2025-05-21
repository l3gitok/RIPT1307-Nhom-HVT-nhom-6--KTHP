const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Hoặc email service khác như SendGrid, SES...
    auth: {
      user: process.env.EMAIL_USER, // Email dùng để gửi
      pass: process.env.EMAIL_PASS  // Password của email
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
