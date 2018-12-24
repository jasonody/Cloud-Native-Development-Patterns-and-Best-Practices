'use strict'

const aws = require('aws-sdk')
const uuid = require('uuid')

module.exports.deleteCategory = (evt, context, callback) => {
  console.log('delete category input event: %j', evt)
  
  const category = {
    id: evt.category || 'widgets'
  }

  const event = {
    id: uuid.v1(),
    type: 'category-deleted',
    timestamp: Date.now(),
    tags: {
      userId: uuid.v4(),
    },
    category
  }
  
  console.log('delete category event: %j', event)

  const params = {
    StreamName: process.env.STREAM_NAME,
    PartitionKey: category.id, //Probably shouldn't be a string
    Data: new Buffer(JSON.stringify(event))
  }

  const kinesis = new aws.Kinesis()

  kinesis.putRecord(params).promise()
    .then(res => callback(null, res))
    .catch(err => callback(err))
}