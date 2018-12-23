'use strict';

const aws = require('aws-sdk')
const uuid = require('uuid')
const _ = require('highland')

const eventMappings = {
  INSERT: 'item-created',
  REMOVE: 'item-deleted'
}

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
    type: getEventType(record.eventName),
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
  
  console.log('publish event: %j', event)
  console.log('publish event params: %j', params)

  const kinesis = new aws.Kinesis();

  return _(kinesis.putRecord(params).promise())
}

const getEventType = (eventName) => {
  const mappedEvent = eventMappings[eventName]
  
  return mappedEvent || 'item-unknown'
}

module.exports.consume = (event, context, callback) => {
  console.log('event: %j', event);
  callback();
};
