/**
 * This file configures AWS settings for production environment
 */
const AWS = require('aws-sdk');
require('dotenv').config();

const configureAWS = () => {
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    console.log('Configuring AWS for production environment');
    
    // Set AWS region
    AWS.config.update({
      region: process.env.AWS_REGION,
    });
    
    // Return production database config
    return {
      user: process.env.PRODUCTION_DB_USER || process.env.DB_USER,
      host: process.env.PRODUCTION_DB_HOST || process.env.DB_HOST,
      database: process.env.PRODUCTION_DB_NAME || process.env.DB_NAME,
      password: process.env.PRODUCTION_DB_PASSWORD || process.env.DB_PASSWORD,
      port: process.env.PRODUCTION_DB_PORT || process.env.DB_PORT,
    };
  }
  
  // Return local database config
  return {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };
};

module.exports = { configureAWS };
