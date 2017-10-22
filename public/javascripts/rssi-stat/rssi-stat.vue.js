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
          hideTable: false,
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
              data.forEach(this.addRecordHandler);
              this.refreshRssiTable();
            });
          },
          scanGroupSelectChange: function(value) {
            if(this.selectedScanGroup !== value) {
              this.selectedScanGroup = value;
              if(this.selectedScanGroup !== '') {
                this.getRssiRecords();
              } else {
                this.rssiRecords = {};
                this.refreshRssiTable();
              }
            }
          },
          refreshRssiTable: function() {
            this.rssiRecordsArray = Object.values(this.rssiRecords);
          },
          addRecordHandler: function(item) {
            const device = item.device;
            if(this.rssiRecords[device]) {
              this.rssiRecords[device].push(item);
            } else {
              this.rssiRecords[device] = [item];
            }
          },
          hideTableHandler: function() {
            this.hideTable = true;
          },
          showTableHandler: function() {
            this.hideTable = false;
          }
        }
      });
    };
    const onChange = function() {
      comp.comp.getScanGroups();
      // comp.comp.getRssiRecords();
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
      'placeholder="请选择" ' +
      ':placeholder-can-select="true" ' +
      'v-bind:options="scanGroupTexts" ' +
      'v-bind:value="selectedScanGroup" ' +
      'v-bind:on-change="scanGroupSelectChange" ' +
      'rand-id="scanGroup" ' +
      '></vue-select>' +
      '</div>' +
      '</div>' +
      '<div class="col">' +
      '<vue-button ' +
      'class="mr-2" ' +
      'name="刷新分组" ' +
      ':callback="getScanGroups" ' +
      ':appear="true" ' +
      ':disabled="false" ' +
      'button-class="btn-info" ' +
      '></vue-button>' +
      '<vue-button ' +
      'class="mr-2" ' +
      'name="隐藏表格" ' +
      ':callback="hideTableHandler" ' +
      ':appear="!hideTable && rssiRecordsArray.length > 0" ' +
      ':disabled="false" ' +
      'button-class="btn-info" ' +
      '></vue-button>' +
      '<vue-button ' +
      'class="mr-2" ' +
      'name="显示表格" ' +
      ':callback="showTableHandler" ' +
      ':appear="hideTable && rssiRecordsArray.length > 0" ' +
      ':disabled="false" ' +
      'button-class="btn-info" ' +
      '></vue-button>' +
      '</div>' +
      '</div>' +
      '<ul class="row">' +
      '<li class="col-3 device-rssi-column" v-for="deviceRecords in rssiRecordsArray">' +
      '<vue-rssi-stat ' +
      ':title="deviceRecords[0].device" ' +
      ':records="deviceRecords" ' +
      ':table-format="rssiFormat" ' +
      ':hide-table="hideTable" ' +
      '></vue-rssi-stat>' +
      '</li>' +
      '</ul>' +
      '<div class="row">' +
      '<div class="col" v-for="index in 4">' +
      '<div class="container">' +
      '<vue-n-calculator style="width: 200px;" :d1="1" :d2="2"></vue-n-calculator>' +
      '</div> ' +
      '</div>' +
      '</div>' +
      '<div class="row">' +
      '<div class="col" v-for="index in 4">' +
      '<div class="container">' +
      '<vue-d-calculator style="width: 200px;" :d1="1"></vue-d-calculator>' +
      '</div> ' +
      '</div>' +
      '</div>' +
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
    init,
    overview
  };
})();