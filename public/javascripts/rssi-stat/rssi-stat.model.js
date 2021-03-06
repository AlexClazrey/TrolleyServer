rssiStat.model = (function () {
  "use strict";
  let socket;
  const init = () => {
    socket = io('/rssi');
    socket.on('connect', function () {
      console.log('socket connected to rssi server');
    });
    socket.on('disconnect', function () {
      console.warn('socket lost connection');
    });
    socket.on('rssi-record-v2', function(data) {
      if(rssiStat.vue && rssiStat.vue.overview && rssiStat.vue.overview.comp) {
        const comp = rssiStat.vue.overview.comp.comp;
        if(data.scanGroup === comp.selectedScanGroup) {
          comp.addRecordHandler(data);
        }
        if(comp.scanGroupRecords.find(function(item) {
            return item._id === data.scanGroup;
          }) === undefined) {
          console.log('refresh scan group');
          comp.getScanGroups();
        }
      }
    })
  };

// result schema
// {
//  "_id" : "<scanGroup>",
//  "minTime" : ISODate("2017-10-21T17:45:08.165Z"),
//  "maxTime" : ISODate("2017-10-21T17:45:09.408Z"),
//  "tag": max(tag),
// }
  const getScanGroups = () => {
    return new Promise(function (resolve, reject) {
      if (socket) {
        socket.once('get-scan-groups', function (data) {
          resolve(data);
        });
        socket.emit('get-scan-groups');
      } else {
        reject();
      }
    });
  };

  const queryRssiWithScanGroup = (scanGroup) => {
    return new Promise(function (resolve, reject) {
      if (socket) {
        socket.once('get-rssi-records', function (data) {
          resolve(data);
        });
        socket.emit('get-rssi-records', {scanGroup});
      } else {
        reject();
      }
    })
  };

  return {
    init,
    getScanGroups,
    queryRssiWithScanGroup,
  };
})();