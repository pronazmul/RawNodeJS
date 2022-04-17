/*
* Title: Read Data From File System
* Description: Make Array of data and Export it.
* Author: Nazmul Huda
* Date: 04/17/2022
*/


// Module Scaffolding
const math = {}

// Function Get Two Numbers and Return the random number between them
math.getRandomNumber = (min, max) => {

    let minimum = typeof min === 'number' ? min : 0
    let maximum = typeof max === 'number' ? max : 0

    // Get Two Numbers and Return the random number between them
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
}


//Module Export
module.exports = math