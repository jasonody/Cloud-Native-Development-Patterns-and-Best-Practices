'use strict';

const aws = require('aws-sdk')
const _ = require('highland')

aws.config.update({
  region: 'us-east-1'
})

const deletedCategories = ['widgets', 'jars']

const getItemIdsForCategory = (category) => {
  var params = {
    TableName: "dev-cndp-trilateral-api-t1",
    ProjectionExpression: "id",
    FilterExpression: "category = :c",
    ExpressionAttributeValues: {
         ":c": category
    }
  };
  
  console.log('getItemIdsForCategory params: %j', params)
  
  const db = new aws.DynamoDB.DocumentClient()
  
  return _(db.scan(params).promise())
}

const flagAsDeleted = item => {
  console.log('flag as deleted item: %j', item)
  const params = {
    TableName: 'dev-cndp-trilateral-api-t1',
    Key: {
      id: item.id
    },
    UpdateExpression: 'set deleted = :d',
    ExpressionAttributeValues: {
      ':d': true
    }
  }

  console.log('Update params: %j', params)

  const db = new aws.DynamoDB.DocumentClient()

  return _(db.update(params).promise())
}

const callback = (err, data) => err ? console.log('Error: %j', err) : console.log('Data: %j', data)

_(deletedCategories)
  .flatMap(getItemIdsForCategory)
  .flatMap(i => i.Items)
  .flatMap(flagAsDeleted)
  .collect()
  .toCallback(callback)