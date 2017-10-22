rssi.model = (function () {
  let socket;
  // schema: { device:string, records: [{ timestamp: int, rssi: int, tag: string }...]
  const rssiRecords = [];
  const init = function () {
    socket = io('/rssi');
    socket.on('connect', function () {
      console.log('rssi socket.io connected');
    });
    socket.on('rssi-record', function (data) {
      const record = {
        rssi: data.rssi,
        timestamp: data.timestamp,
        tag: data.tag
      };
      const deviceRecords = rssiRecords.filter(function (item) {
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