'use strict'

process.env.STREAM_NAME = 'dev-cndp-cqrs-oplock-stream'

const aws = require('aws-sdk')

const handler = require('./handler')

aws.config.update({
  region: 'us-east-1'
})

const callback = (err, data) => err ? console.log('Error: %j', err) : console.log('Data: %j', data)

handler.command(null, {}, callback)