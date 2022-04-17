/*
* Title: Read Data From File System
* Description: Make Array of data and Export it.
* Author: Nazmul Huda
* Date: 04/17/2022
*/

//Dependencieds
const fs = require('fs')
const path = require('path')


// Module Scaffolding
const qoute = {}

//Function to read data from file system and make an array of data
qoute.getQoute = () => {
    // Read Data From File System
    const qoute = fs.readFileSync(path.join(__dirname, './qotes.txt'), 'utf-8')

    // Make Array of data and Export it.
    return qoute.split('\r\n')
}


//Module Export
module.exports = qoute


