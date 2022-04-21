/*
 * Title : Environments
 * Description: Pass Environment Variables to All Application Checking process Environment Variables
 * Author: Nazmul Huda
 * Date : 19/04/2022
 */

// Module Scaffolding:
const env = {}

env.development = {
  port: 3000,
  env: 'development',
  secretKey: 'pronazmul',
  twlio: {
    fromPhone: '+19379156871',
    account_sid: 'AC1c8d84d5b197316c91377417da1cdd52',
    auth_token: 'a5fbe86f0c2c0675154a359109c0bdc5',
  },
}

env.production = {
  port: 5000,
  env: 'production',
  secretKey: 'pronazmul',
  twlio: {
    fromPhone: '+19379156871',
    account_sid: 'AC1c8d84d5b197316c91377417da1cdd52',
    auth_token: 'a5fbe86f0c2c0675154a359109c0bdc5',
  },
}

// Check Environment from process.env
const currentEnv =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() === 'production'
    ? env.production
    : env.development

// Module Export:
module.exports = currentEnv
