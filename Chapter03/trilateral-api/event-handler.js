'use strict';

const aws = require('aws-sdk')
const uuid = require('uuid')
const _ = require('highland')

const eventMappings = {
  INSERT: 'item-created',
  MODIFY: 'item-updated',
  FLAGGED_DELETED: 'item-deleted',
  REMOVE: 'item-removed',
}

module.exports.publish = (event, context, callback) => {
  console.log('event: %j', event);

  _(event.Records)
    .flatMap(publishEvent)
    .collect()
    .toCallback(callback)
};

const publishEvent = (record) => {
  //We could translate the DynamoDB CDC model to our own model before publishing
  const event = {
    id: uuid.v1(),
    type: getEventType(record),
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

const getEventType = (record) => {
  if (isFlaggedAsDeleted(record)) return mappedEvent['FLAGGED_DELETED']

  const mappedEvent = eventMappings[record.eventName]
  
  return mappedEvent || 'item-unknown'
}

const isFlaggedAsDeleted = (record) => record.eventName === 'MODIFY' &&
  record.dynamodb.NewImage.deleted.BOOL && !record.dynamodb.OldImage.deleted.BOOL

module.exports.consume = (event, context, callback) => {
  console.log('event: %j', event);

  //TODO: react to category-deleted event and flag all items in that category as deleted

  callback();
};
