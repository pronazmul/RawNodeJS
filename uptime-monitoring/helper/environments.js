/*
* Title : Environments
* Description: Pass Environment Variables to All Application Checking process Environment Variables
* Author: Nazmul Huda
* Date : 19/04/2022
*/

// Module Scaffolding:
const env = {};

env.development ={
    port:3000,
    env:'development',
}

env.production ={
    port:5000,
    env:'production',
}

// Check Environment from process.env
const currentEnv = process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() === 'production' ? env.production : env.development;

// Module Export:
module.exports = currentEnv;    