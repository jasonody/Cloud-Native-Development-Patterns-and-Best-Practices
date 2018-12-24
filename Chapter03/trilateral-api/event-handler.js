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
  if (isFlaggedAsDeleted(record)) return eventMappings['FLAGGED_DELETED']

  const mappedEvent = eventMappings[record.eventName]
  
  return mappedEvent || 'item-unknown'
}

const isFlaggedAsDeleted = (record) => record.eventName === 'MODIFY' &&
  record.dynamodb.NewImage.deleted.BOOL && !record.dynamodb.OldImage.deleted.BOOL

module.exports.consume = (event, context, callback) => {
  console.log('event: %j', event);

  //TODO: react to category-deleted event and flag all items in that category as deleted
  _(event.Records)
    .map(recordToEvent)
    .tap(e => console.log('mapped category deleted event: %j', e))
    .filter(forCategoryDeleted)
    .flatMap(flagAsDeleted)
    .collect()
    .toCallback(callback)
};

const recordToEvent = record => JSON.parse(new Buffer(record.kinesis.data, 'base64'))

const forCategoryDeleted = event => event.type === 'category-deleted'

const flagAsDeleted = (event) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: 'category.id-index',
    //Key: {'id': event.category.id},
    Key: {
      //'category': { 'id': event.category.id }
      'id': 'bda8f685-af12-4829-b90a-40dc0edc97ad'
    },
    //KeyConditionExpression: 'id = :id', 
    UpdateExpression: 'set deleted = :d',
    ExpressionAttributeValues: {
      ':d': true,
      //':id': event.category.id
    }
  }

  console.log('flag as deleted params: %j', params)

  const db = new aws.DynamoDB.DocumentClient()

  return _(db.update(params).promise())
}