/*
 * Title : Twlio Message Sender
 * Description: All about Twlio Messsage Sender
 * Author: Nazmul Huda
 * Date : 21/04/2022
 */

// Dependencies
const https = require('https')
const { twlio } = require('./environments')

// Module Scaffolding
const notification = {}

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

notification.sendTwlioMessage('01746888130', 'Hello World', (err, data) => {
  if (err) {
    console.log(err)
  } else {
    console.log('SMS Send Successfully')
  }
})

// Export Module
module.exports = notification
