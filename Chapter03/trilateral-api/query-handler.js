'use strict'

const aws = require('aws-sdk')
const uuid = require('uuid')
const _ = require('highland')

module.exports.get = (event, context, callback) => {
  console.log('event: %j', event);

  //TODO:Get an item by its key

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Cloud Native Development Patterns and Best Practices! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);
};