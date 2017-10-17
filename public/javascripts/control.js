var control = (function() {
  var socket;
  var carStart = function() {
    socket.emit('car-command', 'front');
  };
  var carStop = function() {
    socket.emit('car-command', 'pause');
  };
  var carLeft = function() {
    socket.emit('car-command', 'left');
  };
  var carRight = function() {
    socket.emit('car-command', 'right');
  };
  var servoStart = function() {
    socket.emit('car-command', 'servo start');
  };
  var servoStop = function() {
    socket.emit('car-command', 'servo stop');
  };

  var init = function() {
    socket = io('/browser');
    var btnStart = document.getElementById('carStart');
    btnStart.addEventListener('click', function() {
      carStart();
    });
    var btnStop  = document.getElementById('carStop');
    btnStop.addEventListener('click', function() {
      carStop();
    });
    var btnLeft  = document.getElementById('carLeft');
    btnLeft.addEventListener('mousedown', function() {
      carLeft();
    });
    btnLeft.addEventListener('mouseup', function() {
      carStart();
    });
    btnLeft.addEventListener('touchstart', function() {
      carLeft();
    });
    btnLeft.addEventListener('touchend', function() {
      carStart();
    });
    var btnRight  = document.getElementById('carRight');
    btnRight.addEventListener('mousedown', function() {
      carRight();
    });
    btnRight.addEventListener('mouseup', function() {
      carStart();
    });
    btnRight.addEventListener('touchstart', function() {
      carRight();
    });
    btnRight.addEventListener('touchend', function() {
      carStart();
    });
    document.getElementById('servoStart').addEventListener('click', servoStart);
    document.getElementById('servoStop').addEventListener('click', servoStop);
    document.getElementById('carBack').addEventListener('click', function() {
      socket.emit('car-command', 'back');
    });
    document.getElementById('sonicScan').addEventListener('click', function() {
      socket.emit('car-command', 'sonic scan');
    });
  };
  return {
    init: init
  };
})();
