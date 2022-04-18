/*
* Title: User route Handlers.
* Description: User All route Hanler
* Author: Nazmul Huda
* Date: 18/04/2022
*/

// Module Scaffolding
const handlr = {}

handlr.userHandler = (requestProperties, callback)=>{

    callback(200, {
        "message": "Welcome from User Hanler"
    })
}

module.exports = handlr