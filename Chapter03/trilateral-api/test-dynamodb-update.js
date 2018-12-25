'use strict';

const aws = require('aws-sdk')
const _ = require('highland')

aws.config.update({
  region: 'us-east-1'
})

// const params = {
//   TableName: 'dev-cndp-trilateral-api-t1',
//   IndexName: 'category-index',
//   Key: {
//     id: '2f42d588-49fc-443b-880e-6f1646f80b5f'
//   },
//   UpdateExpression: 'set deleted = :d',
//   ExpressionAttributeValues: {
//     ':d': true
//   }
// }

var params = {
  TableName: "dev-cndp-trilateral-api-t1",
  ProjectionExpression: "id",
  FilterExpression: "category = :c",
  ExpressionAttributeValues: {
       ":c": "widgets"
  }
};

console.log('flag as deleted params: %j', params)

const db = new aws.DynamoDB.DocumentClient()

db.scan(params).promise()
  .then(res => handleScan(res))
  .catch(err => console.log('Error: %j', err))

const handleScan = (data) => {
  console.log('scan results: %j', data)

  _(data.Items)
    .flatMap(flagAsDeleted)
    .collect()
    .done()
}

const flagAsDeleted = item => {
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

  return _(db.update(params).promise())
}