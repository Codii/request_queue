window.requestQ = function() {
  var Q;
  Q = [];
  return {
    failures: 0,
    defaultInterval: 1000,
    currentInterval: 1000,
    maxSize: 80,
    running: false,
    debug: false,
    add: function(params) {
      if (Q.length < this.maxSize) {
        Q.push(params);
        if (this.debug) console.log("Pushing a new request - currently " + Q.length + " in the queue");
      } else {
        if (this.debug) console.log("Queue is full. Rejecting request.");
      }
    },
    delay: function() {
      if (this.debug) console.log("Delaying run to " + this.currentInterval);
      return this.tid = window.setTimeout((function(_this) {
        return function() {
          _this.run.apply(_this, []);
        };
      })(this), this.currentInterval);
    },
    run: function() {
      this.running = true;
      if (Q.length > 0) {
        Q[0].complete = (function(_this) {
          return function(response) {
            if (response.status === 200) {
              _this.currentInterval = _this.defaultInterval;
              Q.shift();
              if (_this.debug) console.log("Request success ! " + Q.length + " requests left.");
              return _this.run.apply(_this, []);
            } else {
              _this.failures++;
              _this.currentInterval *= 2;
              return _this.delay();
            }
          };
        })(this);
        $.ajax(Q[0]);
      } else {
        this.delay();
      }
      return this;
    },
    stop: function() {
      Q = [];
      clearTimeout(this.tid);
      return this.running = false;
    }
  };
};
