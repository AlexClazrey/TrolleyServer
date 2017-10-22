const rssiStat = (function() {
  "use strict";
  const init = function(container) {
    rssiStat.model.init(container);
    rssiStat.vue.init(container);
  };
  return {
    init
  };
})();