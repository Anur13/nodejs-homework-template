const nodemailer = require('nodemailer')
const fromEmail = process.env.EMAIL
const pass = process.env.EPASS
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: fromEmail,
    pass: pass
  }
})
async function sender (email, message) {
  const result = await transport.sendMail({
    from: fromEmail,
    to: email,
    subject: 'Verification',
    html: `<b> ${message} </b>`
  })
}
// console.log(email, pass);
// main()
module.exports = sender
