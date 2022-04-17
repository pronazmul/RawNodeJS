/*
* Title: Random API Printer from File System.
* Description: This is a simple nodejs server that will print a random file from the filesystem.
* Author: Nazmul Huda
* Date: 04/17/2022
*/

// Dependencieds
const qotes = require('./lib/qotes')
const math = require('./lib/math')

// Module Scaffolding
const app ={}

//Configuration 
app.config = {
    quotesTimer: 1000,
}

// Function to print a random qoute
app.printQoute = () => {

    //Get All Quotes
    const allQotes = qotes.getQoute() 

    //Get Random Number
    const randomNumber = math.getRandomNumber(0, allQotes.length - 1)

    //Print Random Qoute
    console.log(allQotes[randomNumber])

}

// Infinite Loop to print random qoute
setInterval(() => app.printQoute(), app.config.quotesTimer)


