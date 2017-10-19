rssi.vue = (function() {
  var overview = (function() {
    var comp = {};
    var onMount = function() {
      comp.comp = new Vue({
        el: '#rssi-records',
        data: {
          rssiRecords: rssi.model.rssiRecords,
          rssiFormat: [
            {name: '标签', key: 'tags'},
            {name: '时间', key: 'timestamp', component: 'milliTime'},
            {name: 'RSSI', key: 'rssi'}
          ]
        }
      });
    };
    var onChange = function () {
    };
    return {
      html:
        '<h1>Rssi Records</h1>' +
        '<div id="rssi-records">' +
        '<ul class="row">' +
        '<li class="col" v-for="deviceRecords in rssiRecords">' +
        '<h3>{{ deviceRecords.device }}</h3>' +
        '<vue-table ' +
        ':hide-button="true" ' +
        ':format="rssiFormat" ' +
        ':content="deviceRecords.records" ' +
        '>' +
        '</vue-table>' +
        '</li>' +
        '</ul>' +
        '</div>',
      onMount: onMount,
      onChange: onChange,
      comp: comp
    };
  })();

  var init = function(container) {
    container.html(overview.html);
    overview.onMount();
  };
  return {
    init: init
  }
})();