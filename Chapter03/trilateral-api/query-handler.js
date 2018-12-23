'use strict'

const aws = require('aws-sdk')
const uuid = require('uuid')
const _ = require('highland')

module.exports.get = (event, context, callback) => {
  console.log('event: %j', event);

  const params = {
    Key: { 'id': event.pathParameters.id },
    TableName: process.env.TABLE_NAME
  }

  console.log('params: %j', params)

  const db = new aws.DynamoDB.DocumentClient()
  db.get(params).promise()
    .then(res => callback(null, buildResponse(res, isEmptyObject(res) ? 404 : 200)))
    .catch(err => callback(null, buildResponse(err, err.statusCode || 500)))
};

const isEmptyObject = (obj) => {
  for(let key in obj) {
    if(obj.hasOwnProperty(key))
        return false;
  }
  return true;
}

// We should translate the dynamoDb model to out own model before returning
const buildResponse = (body, statusCode) => ({ 
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body),
})