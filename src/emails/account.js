const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_Key)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email, 
    from: 'megumi67@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}. Let me know how to get along with the pp.`
    //html: ''も使える
  })
}

const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'megumi67@gmail.com',
    subject: 'Your account is deleted',
    text: `Good Bye ${name} !`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail
}