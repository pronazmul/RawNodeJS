/*
 * Title: Worker
 * Description: Background Wroker Process witch will check all saved checks and notified user.
 * Author: Nazmul Huda
 * Date: 22/04/2022
 */

// DEPENDENCIES
const http = require('http')
const https = require('https')
const { parse } = require('url')
const db = require('./data')
const { jsonStringToObject } = require('../helper/utilities')
const { sendTwlioMessage, sendMail } = require('../helper/notification')

// SCAFFOLDING
const worker = {}

// GATHER ALL CHECKS
worker.gatherAllChecks = () => {
  // LOOKUP ALL CHECKS
  db.list('checks', (error, fileNames) => {
    if (!error) {
      //LOOKUP ALL CHECKS INDEVIDUAL DATA
      fileNames.forEach((check) => {
        db.read('checks', check, (error, data) => {
          if (!error) {
            let checkData = jsonStringToObject(data)
            // PASS CHECKDATA TO VALIDATE FUNCTION
            worker.validateCheckData(checkData)
          } else {
            console.log('Problem occured to find check data!')
          }
        })
      })
    } else {
      console.log("Couldn't Find Any Checks To Process!")
    }
  })
}

// VALIDATE CHECK DATA
worker.validateCheckData = (checkObject) => {
  if (checkObject && checkObject.id) {
    checkObject.status =
      typeof checkObject.status === 'string' &&
      ['up', 'down'].includes(checkObject.status)
        ? checkObject.status
        : 'down'
    checkObject.lastChecked =
      typeof checkObject.lastChecked === 'number' && checkObject.lastChecked > 0
        ? checkObject.lastChecked
        : false

    // PASS VALIDATE CHECK OBJECT TO NEXT PROCESS
    worker.perform(checkObject)
  } else {
    console.log('There was a problem in your check')
  }
}

// PERFORM CHECK
worker.perform = (checkObject) => {
  //REQUEST OUTCOME
  const outCome = {
    error: false,
    responseCode: false,
  }
  let outcomeSent = false

  // PARSE URL USING `url.parse()` FOR USING EFFECIANTLY
  const parsedURL = parse(`${checkObject.protocol}://${checkObject.url}`, true)

  //PREPARE REQUEST OBEJCT FOR REQUESTS
  const requestObject = {
    protocol: parsedURL.protocol,
    hostname: parsedURL.hostname,
    method: checkObject.method.toUpperCase(),
    path: parsedURL.path,
    timeout: checkObject.timeoutSecond * 1000,
  }

  //SELECTED PROTOCOL TO USE
  const selectedProtocol = checkObject.protocol === 'http' ? http : https

  //INITIALIZE REQUEST
  const req = selectedProtocol.request(requestObject, (res) => {
    const status = res.statusCode
    outCome.responseCode = status
    if (!outcomeSent) {
      worker.requestOutcome(checkObject, outCome)
      outcomeSent = true
    }
  })

  //ERROR LISTENTER
  req.on('error', (e) => {
    outCome.error = true
    outCome.errorValue = e
    if (!outcomeSent) {
      worker.requestOutcome(checkObject, outCome)
    }
  })

  //TIMEOUT LISTENTER
  req.on('timeout', () => {
    outCome.error = true
    outCome.errorValue = 'Request Timeout'
    if (!outcomeSent) {
      worker.requestOutcome(checkObject, outCome)
    }
  })

  //REQUEST SEND
  req.end()
}

//SAVE REQUEST OUTCOME TO DATABASE AND PROCESS FOR NEXT NOTIFICATION
worker.requestOutcome = (checkObject, outcome) => {
  //CHECK OUTCOME UP OR DOWN
  const status =
    !outcome.error &&
    outcome.responseCode &&
    checkObject.successCodes.includes(outcome.responseCode)
      ? 'up'
      : 'down'

  // //NOTIFICATION WANTED OR NOT
  const notificationWanted = !!(
    checkObject.lastChecked && checkObject.status !== status
  )

  //MODIFY CHECK DATA TO STORE DATABASE
  checkObject.status = status
  checkObject.lastChecked = Date.now()

  //   UPDATE REQUEST OUTCOME TO DATABASE
  db.update('checks', checkObject.id, checkObject, (error) => {
    if (!error) {
      if (notificationWanted) {
        worker.notificationSender(checkObject)
      } else {
        console.log(
          status === 'up'
            ? `Your Website ${checkObject.url
                .split('.')[0]
                .toUpperCase()} is up and Running!`
            : `Your Website ${checkObject.url
                .split('.')[0]
                .toUpperCase()} is down !`
        )
      }
    } else {
      console.log(`Error trying to sate data at - ${checkObject.url}`)
    }
  })
}

//SEND NOTIFICATION TO USER IF ANY STATE CHANGED
worker.notificationSender = (checkResult) => {
  const message =
    checkResult.status === 'up'
      ? `
  Your Website ${checkResult.url.split('.')[0].toUpperCase()} is up and Running!
  We are ovserbing your site each 1 minute, We will let you know if your site gets down.
  `
      : `
  We are so sorry ${checkResult.url.split('.')[0].toUpperCase()} is Down!
  Please contract to your system adminsitrator to fix this issue.
  We are ovserbing your site each 1 minute, We will let you know if your site gets down.
  `

  //SEND NOTIFICATION USING TWLIO
  // sendTwlioMessage(checkResult.userPhone, message, (error) => {
  //   if (!error) {
  //     console.log('A message has beed send to user')
  //   } else {
  //     console.log('Error: Problem ocurred while sending request!')
  //   }
  // })

  //SEND NOTIFICATION USING NodeMailer
  sendMail(
    'alimurdipu@gmail.com, developernazmul@gmail.com, it@coastguard.gov.bd',
    'Coast Guard Application State',
    message,
    (err, data) => {
      if (err) {
        console.log(err)
      } else {
        console.log(data)
      }
    }
  )
}

// RUN THIS PROCESS CONTINOUSLY EACH 30 SEC
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks()
  }, 1000 * 60)
}

// START WORKER
worker.init = () => {
  //COLLECT ALL CHECKS
  worker.gatherAllChecks()

  //CALL THE LOOP TO RUN THIS PROCESS
  worker.loop()
}

//MODULE EXPORT
module.exports = worker
