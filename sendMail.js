const nodemailer = require('nodemailer');

function SendMail(sendTo) {
    
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourmail',
    pass: 'yourpass'
  }
});

var mailOptions = {
  from: "yourmail",
  to: `${sendTo}`,
  subject: "Sending Email using Node.js",
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333;">Hello!</h1>
        <p style="font-size: 16px; color: #555;">
         Email sent successfully!
        </p>
        <p style="font-weight: bold; color: #333;">Best regards,<br>ME</p>
      </div>
    </div>
  `,
};
    
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { SendMail }