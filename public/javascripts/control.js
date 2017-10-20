const control = (function() {
  let socket;
  const carStart = function() {
    socket.emit('car-command', 'front');
  };
  const carStop = function() {
    socket.emit('car-command', 'pause');
  };
  const carLeft = function() {
    socket.emit('car-command', 'left');
  };
  const carRight = function() {
    socket.emit('car-command', 'right');
  };
  const servoStart = function() {
    socket.emit('car-command', 'servo start');
  };
  const servoStop = function() {
    socket.emit('car-command', 'servo stop');
  };

  const init = function() {
    socket = io('/browser');
    const btnStart = document.getElementById('carStart');
    btnStart.addEventListener('click', function() {
      carStart();
    });
    const btnStop  = document.getElementById('carStop');
    btnStop.addEventListener('click', function() {
      carStop();
    });
    const btnLeft  = document.getElementById('carLeft');
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
    const btnRight  = document.getElementById('carRight');
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
