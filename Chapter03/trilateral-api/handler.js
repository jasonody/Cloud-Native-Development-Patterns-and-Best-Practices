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

  _(event.Records)
    .flatMap(publishEvent)
    .collect()
    .toCallback(callback)
};

const publishEvent = (record) => {
  const event = {
    id: uuid.v1(),
    type: 'item-created',
    timestamp: Date.now(),
    tags: {
      userId: "User123"
    },
    record
  }

  const params = {
    StreamName: process.env.STREAM_NAME,
    PartitionKey: record.dynamodb.Keys.id.S,
    Data: new Buffer(JSON.stringify(event)),
  }

  console.log('publish event params: %j', params)

  const kinesis = new aws.Kinesis();

  return _(kinesis.putRecord(params).promise())
}

module.exports.consume = (event, context, callback) => {
  console.log('event: %j', event);
  callback();
};
