'use strict';

const aws = require('aws-sdk');
const _ = require('highland');

module.exports.consume = (event, context, cb) => {
  console.log('consumeFault event: %j', event);

  _(event.Records)
    .map(recordToUow)
    .tap(print)
    .filter(forFaultedItem)
    .tap(printFault)
    .collect()
    .toCallback(cb)
}
  
const recordToUow = r => ({
  record: r,
  event: JSON.parse(new Buffer(r.kinesis.data, 'base64'))
});

const print = uow => console.log('uow: %j', uow);

const forFaultedItem = record => record.event && record.event.type === 'fault';

const printFault = record => console.log(`fault occured: ${record.event.err.message}`);