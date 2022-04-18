/*
* Title: Not Found Handlers.
* Description: Handle UnDelired Path Request
* Author: Nazmul Huda
* Date: 18/04/2022
*/

// Module Scaffolding
const handlr = {}

handlr.notFoundHanler = (requestProperties, callback)=>{
    callback(404, {
        "message": "Your Requested Path Not Found!"
    })
}

module.exports = handlr