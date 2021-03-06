"use strict";
const dbMaker = require('./mongo');
const db = dbMaker();

//  record schema
//  {
//    device: string,
//    phone: string,
//    tag: string,
//    time: Date,
//    scanGroup: string,
//    distance: number, 球坐标系-r
//    angle: [number(phi), number(theta)], 球坐标系-[phi, theta]
//    RSSI: number
//  }

const rssiSchema = [
  {name: 'device', type: 'string', required: true, regex: /([A-F0-9]{2}:){5}[A-F0-9]{2}/},
  {name: 'phone', type: 'string'},
  {name: 'tag', type: 'string'},
  {name: 'scanGroup', type: 'string'},
  {name: 'time', type: Date, required: true},
  {name: 'distance', type: 'number', nullable: true},
  {name: 'angle', type: Array, elType: 'number', elNullable: true},
  {name: 'RSSI', type: 'number', required: true}
];

const checkSchema = function (record, schema) {
  if (!record) {
    return false;
  }
  if (!(record instanceof Object)) {
    return false;
  }
  const result = {};
  let flag = true;
  schema.forEach(function (schemaItem) {
    // check if schema entry is valid
    if (!schemaItem.name || schemaItem.disabled) {
      return;
    }
    // check if required
    if (schemaItem.required && !record.hasOwnProperty(schemaItem.name)) {
      flag = false;
      return;
    }
    // check type requirements
    let recordItem = record[schemaItem.name];
    if (schemaItem.type) {
      if (recordItem === null && schemaItem.nullable) {
      } else {
        if (typeof schemaItem.type === 'string') {
          if (typeof recordItem !== schemaItem.type) {
            flag = false;
            return;
          }
        } else {
          if (!(recordItem instanceof schemaItem.type)) {
            flag = false;
            return;
          }
        }
      }
    }
    if (!flag)
      return;

    // check element type
    if (schemaItem.elType && (recordItem instanceof Array)) {
      recordItem.forEach(function (element) {
        if (element === null && schemaItem.elNullable) {
        } else {
          if (typeof schemaItem.elType === 'string') {
            if (typeof element !== schemaItem.elType) {
              flag = false;
            }
          } else {
            if (!(element instanceof schemaItem.elType)) {
              flag = false;
            }
          }
        }
      });
    }
    if (!flag)
      return;
    // check regex
    if (schemaItem.regex && typeof recordItem === 'string') {
      if (!schemaItem.regex.test(recordItem)) {
        flag = false;
        return;
      }
    }
    // write out
    result[schemaItem.name] = recordItem;
  });
  if (!flag)
    return false;
  else
    return result;
};

const addRssi = function (record) {
  return db.connect().then(
    function (db) {
      return new Promise(function (resolve, reject) {
        const rssi = db.collection('rssi');
        const document = checkSchema(record, rssiSchema);
        if (document) {
          rssi.insertOne(document).then(
            function (result) {
              if (result.insertedCount === 1)
                resolve();
              else {
                console.warn('[Mongodb] insert count not match 1.', result.insertedCount);
                reject();
              }
              db.close();
            },
            function (err) {
              console.error('[Mongodb] rssi insert failed', err, record);
              db.close();
              reject(err);
            });
        } else {
          console.error('[Mongodb] rssi schema not match', record);
          db.close();
          reject();
        }
      });
    },
    function () {
      console.error('[Mongodb] rssi db connect failed');
    });
};

const queryRssi = function (query, projection, sort) {
  return db.connect().then(
    function (db) {
      return new Promise(function (resolve, reject) {
        const rssi = db.collection('rssi');
        let cursor;
        if (query) {
          cursor = rssi.find(query);
        } else {
          cursor = rssi.find();
        }
        if (cursor && Object.keys(projection).length > 0)
          cursor = cursor.project(projection);
        if (cursor && Object.keys(sort).length > 0)
          cursor = cursor.sort(sort);
        if (cursor) {
          cursor.toArray().then(function (data) {
            db.close();
            resolve(data);
          }, function (err) {
            db.close();
            reject(err);
          });
        } else {
          console.error('[Mongodb] query cursor return failed');
          db.close();
          reject();
        }
      });
    },
    function () {
      console.error('[Mongodb] rssi db connect failed');
    }
  );
};

const addHandler = function (record) {
  addRssi(record).then(function () {
    console.log('[Mongodb] record added');
  }, function () {
    console.error('[Mongodb] record add failed');
  }).catch(function (err) {
    console.error(__filename, err);
  })
};

// result schema
// {
//  "_id" : "<scanGroup>",
//  "minTime" : ISODate("2017-10-21T17:45:08.165Z"),
//  "maxTime" : ISODate("2017-10-21T17:45:09.408Z"),
//  "tag": max(tag),
// }
const getScanGroups = function () {
  return db.connect().then(
    function (db) {
      return new Promise(function (resolve, reject) {
        const rssi = db.collection('rssi');
        rssi.aggregate(
          [{
            $group: {
              _id: "$scanGroup",
              minTime: {
                $min: "$time"
              },
              maxTime: {
                $max: "$time"
              },
              tag: {
                $max: "$tag"
              },
            }
          }], function (err, data) {
            db.close();
            if (err) {
              console.error('[Mongodb] aggregate error', err);
              reject(err);
            }
            resolve(data);
          }
        );
      });
    },
    function () {
      console.error('[Mongodb] rssi db connect failed');
    }
  );
};

module.exports = {
  addHandler,
  addRssi,
  queryRssi,
  getScanGroups,
};