const rssi = (function() {
  const init = function(container) {
    rssi.model.init(container);
    rssi.vue.init(container);
  };
  return {
    init: init
  }
})();