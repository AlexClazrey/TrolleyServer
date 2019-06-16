const control = (function() {
  let socket;
  function carStart() {
    socket.emit('car-command', 'front');
  };
  function carStop() {
    socket.emit('car-command', 'stop');
  };
  function carLeft() {
    socket.emit('car-command', 'left');
  };
  function carRight() {
    socket.emit('car-command', 'right');
  };
  function servoStart() {
    socket.emit('car-command', 'servo start');
  };
  function servoStop() {
    socket.emit('car-command', 'servo stop');
  };
  function rotUnc() {
    socket.emit('car-command', 'rot unc');
  };
  function rotClo() {
    socket.emit('car-command', 'rot clo');
  };
  function rotStop() {
    socket.emit('car-command', 'rot stop');
  }
  function xStop() {
    socket.emit('car-command', 'x stop'); 
  }

  function init() {
    socket = io('/browser');
    $('.btn-start').click(carStart);
    $('.btn-stop').click(carStop);
    const btnLeft  = document.getElementById('carLeft');
    btnLeft.addEventListener('mousedown', carLeft);
    btnLeft.addEventListener('mouseup', xStop);
    btnLeft.addEventListener('touchstart', carLeft);
    btnLeft.addEventListener('touchend', xStop);
    const btnRight  = document.getElementById('carRight');
    btnRight.addEventListener('mousedown', carRight);
    btnRight.addEventListener('mouseup', xStop);
    btnRight.addEventListener('touchstart', carRight);
    btnRight.addEventListener('touchend', xStop);
    document.getElementById('rotateClo').addEventListener('mousedown', rotClo);
    document.getElementById('rotateClo').addEventListener('mouseup', rotStop);
    document.getElementById('rotateClo').addEventListener('touchstart', rotClo);
    document.getElementById('rotateClo').addEventListener('touchstop', rotStop);
    document.getElementById('rotateUnc').addEventListener('mousedown', rotUnc);
    document.getElementById('rotateUnc').addEventListener('mouseup', rotStop);
    document.getElementById('rotateUnc').addEventListener('touchstart', rotUnc);
    document.getElementById('rotateUnc').addEventListener('touchstop', rotStop);
    document.getElementById('carBack').addEventListener('click', function() {
      socket.emit('car-command', 'back');
    });
    // document.getElementById('servoStart').addEventListener('click', servoStart);
    // document.getElementById('servoStop').addEventListener('click', servoStop);
    // document.getElementById('sonicScan').addEventListener('click', function() {
      // socket.emit('car-command', 'sonic scan');
    // });
  };
  return {
    init: init
  };
})();
