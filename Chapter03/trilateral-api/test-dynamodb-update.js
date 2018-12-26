'use strict';

const aws = require('aws-sdk')
const _ = require('highland')

const handler = require('./event-handler')

aws.config.update({
  region: 'us-east-1'
})

const kinesisPayload = {
  "Records": [
      {
          "kinesis": {
              "kinesisSchemaVersion": "1.0",
              "partitionKey": "widgets",
              "sequenceNumber": "49591436377533812020897910407909891368707063554580152322",
              "data": "eyJpZCI6IjQ1YTU3ZjQwLTA5NDgtMTFlOS04OTgyLWJmNzJiOTUwYjM0MCIsInR5cGUiOiJjYXRlZ29yeS1kZWxldGVkIiwidGltZXN0YW1wIjoxNTQ1ODU0MTYyMjI4LCJ0YWdzIjp7InVzZXJJZCI6Ijc1NTI5MDc0LTA0NjAtNDA1Ny05N2E3LWIzM2U4ZDI5MmFlNCJ9LCJjYXRlZ29yeSI6IndpZGdldHMifQ==",
              "approximateArrivalTimestamp": 1545854162.374
          },
          "eventSource": "aws:kinesis",
          "eventVersion": "1.0",
          "eventID": "shardId-000000000000:49591436377533812020897910407909891368707063554580152322",
          "eventName": "aws:kinesis:record",
          "invokeIdentityArn": "arn:aws:iam::780510034593:role/cndp-trilateral-api-dev-us-east-1-lambdaRole",
          "awsRegion": "us-east-1",
          "eventSourceARN": "arn:aws:kinesis:us-east-1:780510034593:stream/dev-cndp-trilateral-api-stream"
      }
  ]
}

const callback = (err, data) => err ? console.log('Error: %j', err) : console.log('Data: %j', data)

handler.consume(kinesisPayload, {}, callback)