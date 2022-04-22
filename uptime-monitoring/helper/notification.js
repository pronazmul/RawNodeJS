/*
 * Title : Twlio Message Sender
 * Description: All about Twlio Messsage Sender
 * Author: Nazmul Huda
 * Date : 21/04/2022
 */

// Dependencies
const https = require('https')
const { twlio } = require('./environments')
const nodeMailer = require('nodemailer')

// Module Scaffolding
const notification = {}

//SEND SMS BY TWILIO
notification.sendTwlioMessage = (phone, msg, callback) => {
  let number =
    typeof phone === 'string' && phone.trim().length === 11
      ? phone.trim()
      : false
  let message =
    typeof msg === 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false

  if (number && message) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twlio.account_sid}/Messages.json`
    const auth = `${twlio.account_sid}:${twlio.auth_token}`
    const postData = JSON.stringify({
      From: twlio.fromPhone,
      To: `+88${number}`,
      Body: message,
    })
    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: url,
      auth: auth,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      },
    }
    const request = https.request(requestDetails, (response) => {
      response.on('data', (data) => {
        console.log(data)
      })
      response.on('end', () => {
        callback('SMS send Successfully')
      })
    })
    request.write(postData)
    request.end()
  } else {
    callback('There was a problem with phone or message')
  }
}

//SEND EMAIL BY NODEMAILER
notification.sendMail = (email, subject, message, callback) => {
  let mail =
    typeof email === 'string' && email.trim().length > 0 ? email.trim() : false
  let subject_ =
    typeof subject === 'string' && subject.trim().length > 0
      ? subject.trim()
      : false
  let message_ =
    typeof message === 'string' && message.trim().length > 0
      ? message.trim()
      : false

  if (mail && subject_ && message_) {
    const transporter = nodeMailer.createTransport({
      host: 'premium3.web-hosting.com',
      port: 465,
      secure: true,
      auth: {
        user: 'admin@pronazmul.com',
        pass: 'Nazmul@01',
      },
    })
    const mailOptions = {
      from: 'admin@pronazmul.com',
      to: mail,
      subject: subject_,
      text: message_,
    }
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        callback(err)
      } else {
        callback('Email send Successfully')
      }
    })
  } else {
    console.log('there was a problem with email or message')
  }
}

// Export Module
module.exports = notification
