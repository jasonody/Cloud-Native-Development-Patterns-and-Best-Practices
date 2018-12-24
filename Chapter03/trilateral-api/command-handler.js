'use strict';

const aws = require('aws-sdk');
const uuid = require('uuid');

module.exports.create = (event, context, callback) => {
  console.log('event: %j', event)

  const body = event.body && JSON.parse(event.body) || {}

  const item = {
    id: uuid.v4(),
    name: body.name || 'Cloud Native Development Patterns and Best Practices',
    description: body.description || 'Practical architectural patterns for building modern distributed cloud native systems',
    category: body.category && body.category.toLowerCase() || 'widgets',
    deleted: false,
  }
  
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: item,
  }

  console.log('params: %j', params)

  const db = new aws.DynamoDB.DocumentClient()

  db.put(params).promise()
    .then(res => callback(null, buildResponse({id: item.id}, 200)))
    .catch(err => callback(null, buildResponse(err, 500)))
}

const buildResponse = (body, statusCode) => ({ 
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body),
})

module.exports.update = (event, context, callback) => {
  console.log('event: %j', event)
  
  callback(null, null)
}