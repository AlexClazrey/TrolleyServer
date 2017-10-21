const experiment = (function() {
  "use strict";
  let socket;
  let $phiAdd, $phiMinus, $thetaAdd, $thetaMinus, $phi, $theta, $time;
  let phi = 90, theta = 90;
  const refreshBtn = function() {
    if(phi >= 10) {
      $phiMinus.prop('disabled', false);
    } else {
      $phiMinus.prop('disabled', true);
    }
    if(phi <= 170) {
      $phiAdd.prop('disabled', false);
    } else {
      $phiAdd.prop('disabled', true);
    }
    if(theta >= 10) {
      $thetaMinus.prop('disabled', false);
    } else {
      $thetaMinus.prop('disabled', true);
    }
    if(theta <= 170) {
      $thetaAdd.prop('disabled', false);
    } else {
      $thetaAdd.prop('disabled', true);
    }
  };
  
  const init = function() {
    $phi = $('#p-angle-phi');
    $theta = $('#p-angle-theta');
    $time = $('#p-time');
    phi = parseInt($phi.text());
    theta = parseInt($theta.text());
    if(isNaN(phi) || isNaN(theta)) {
      console.warn('phi theta read failed');
      phi = theta = 90;
    }
    socket = io('/experiment');
    socket.on('connect', function() {
      console.log('connected to experiment server');
    });
    socket.on('servo-direction', function(data) {
      phi = data.phi;
      theta = data.theta;
      $phi.text(data.phi);
      $theta.text(data.theta);
      $time.text(new Date(data.timestamp));
      refreshBtn();
    });
    $phiAdd = $('#btn-add-phi');
    $phiMinus = $('#btn-minus-phi');
    $thetaAdd = $('#btn-add-theta');
    $thetaMinus = $('#btn-minus-theta');
    $phiAdd.click(function() {
      socket.emit('servo-command', {
        phi: phi += 10,
        theta: theta,
      });
      refreshBtn();
    });
    $phiMinus.click(function() {
      socket.emit('servo-command', {
        phi: phi -= 10,
        theta: theta,
      });
      refreshBtn();
    });
    $thetaAdd.click(function() {
      socket.emit('servo-command', {
        phi: phi,
        theta: theta += 10,
      });
      refreshBtn();
    });
    $thetaMinus.click(function() {
      socket.emit('servo-command', {
        phi: phi,
        theta: theta -= 10,
      });
      refreshBtn();
    });
  };
  return {
    init: init
  }
})();