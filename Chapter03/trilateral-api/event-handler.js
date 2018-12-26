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
    Data: Buffer.from(JSON.stringify(event)),
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

  _(event.Records)
    .map(recordToEvent)
    .tap(e => console.log('consume event: %j', e))
    .filter(forCategoryDeleted)
    .flatMap(getItemIdsForCategory)
    .flatMap(i => i.Items)
    .flatMap(flagAsDeleted)
    //.errors(handleErrors)
    .collect()
    .toCallback(callback)
};

const recordToEvent = record => JSON.parse(Buffer.from(record.kinesis.data, 'base64'))

const forCategoryDeleted = event => event.type === 'category-deleted'

const getItemIdsForCategory = (event) => {
  var params = {
    TableName: "dev-cndp-trilateral-api-t1",
    ProjectionExpression: "id",
    FilterExpression: "category = :c",
    ExpressionAttributeValues: {
         ":c": event.category
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

const handleErrors = (err, push) => {
  console.log('ERROR: %j', err)
  
  push(null, err) //handle error
  //push(err) //re-throw error
}