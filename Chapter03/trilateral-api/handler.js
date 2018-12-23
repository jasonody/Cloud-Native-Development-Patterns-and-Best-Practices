'use strict';

const aws = require('aws-sdk')
const uuid = require('uuid')
const _ = require('highland')

module.exports.query = (event, context, callback) => {
  console.log('event: %j', event);

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

module.exports.publish = (event, context, callback) => {
  console.log('event: %j', event);
  callback();
};

module.exports.consume = (event, context, callback) => {
  console.log('event: %j', event);
  callback();
};
