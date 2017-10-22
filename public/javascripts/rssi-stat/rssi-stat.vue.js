rssiStat.vue = (function() {
  "use strict";
  const overview = (function() {
    const comp = {};
    const onMount = function() {
      comp.comp = new Vue({
        el: '#rssi-stat',
        data: {
          scanGroupRecords: [],
          selectedScanGroup: "",
          rssiRecords: {},
          rssiFormat: [
            {name: '时间', key: 'time', component: 'milliTime'},
            {name: 'RSSI', key: 'RSSI'}
          ],
          rssiRecordsArray: [],
        },
        computed: {
          scanGroupTexts: function() {
            return this.scanGroupRecords.map(function(item) {
              return {
                name : `标签 ${item.tag || '未定义'} 开始时间 ${moment(item.minTime).format('MM-DD LTS')} 结束时间 ${moment(item.maxTime).format('MM-DD LTS')}`,
                value: item._id
              };
            });
          },
        },
        methods: {
          getScanGroups: function() {
            rssiStat.model.getScanGroups().then(data => {
              this.scanGroupRecords = data;
            });
          },
          getRssiRecords: function() {
            rssiStat.model.queryRssiWithScanGroup(this.selectedScanGroup).then(data => {
              this.rssiRecords = {};
              data.forEach(item => {
                const device = item.device;
                if(this.rssiRecords[device]) {
                  this.rssiRecords[device].push(item);
                } else {
                  this.rssiRecords[device] = [item];
                }
              });
              this.refreshRssiTable();
            });
          },
          scanGroupSelectChange: function(value) {
            if(this.selectedScanGroup !== value) {
              this.selectedScanGroup = value;
              this.getRssiRecords();
            }
          },
          refreshRssiTable: function() {
            this.rssiRecordsArray = Object.values(this.rssiRecords);
          }
        }
      });
    };
    const onChange = function() {
      comp.comp.getScanGroups();
      comp.comp.getRssiRecords();
    };
    return {
      html: '<h1 class="display-4 title-middle">Rssi Stat</h1>' +
      '<div id="rssi-stat">' +
      '<vue-chapter-title ' +
      'name="分组统计" ' +
      '></vue-chapter-title>' +
      '<div class="row">' +
      '<div class="col">' +
      '<div class="container" style="float: left; width: 800px;">' +
      '<vue-select ' +
      'label="选择分组" ' +
      'placeholder="显示全部" ' +
      'placeholder-can-select="false" ' +
      'v-bind:options="scanGroupTexts" ' +
      'v-bind:value="selectedScanGroup" ' +
      'v-bind:on-change="scanGroupSelectChange" ' +
      'rand-id="scanGroup" ' +
      '></vue-select>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<ul class="row">' +
      '<li class="col-3 device-rssi-column" v-for="deviceRecords in rssiRecordsArray">' +
      '<h3>{{ deviceRecords[0] && deviceRecords[0].device }}</h3>' +
      '<vue-table ' +
      ':hide-button="true" ' +
      ':format="rssiFormat" ' +
      ':content="deviceRecords" ' +
      ':hide-table-off="true" ' +
      '>' +
      '</vue-table>' +
      '</li>' +
      '</ul>' +
      '</div>',
      onMount,
      onChange,
      comp,
    }
  })();
  const init = $container => {
    $container.html(overview.html);
    overview.onMount();
    overview.onChange();
  };
  return {
    init
  };
})();