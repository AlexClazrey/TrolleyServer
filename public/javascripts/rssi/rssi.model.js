rssi.model = (function () {
  var socket;
  // schema: { device:string, records: [{ timestamp: int, rssi: int, tags: string }...]
  var rssiRecords = [];
  var init = function (container) {
    socket = io('/rssi');
    socket.on('connect', function () {
      console.log('rssi socket.io connected');
    });
    socket.on('rssi-record', function (data) {
      var record = {
        rssi: data.rssi,
        timestamp: data.timestamp,
        tags: data.tags
      };
      var deviceRecords = rssiRecords.filter(function (item) {
        return item.device === data.device;
      });
      if (deviceRecords.length > 0) {
        deviceRecords[0].records.push(record);
      } else {
        rssiRecords.push({
          device: data.device,
          records:[record]
        });
      }
    });
  };
  return {
    init: init,
    rssiRecords: rssiRecords
  }
})();