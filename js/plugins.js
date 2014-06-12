// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


var helper = {
    
    initMisc: function() {
        window.log = function(arg) {
            if (dq.constants.DEV) console.log(arg);
        };
        
        $('[role="debug"]').removeAttr('hidden').addClass('transparent').
            click(function() { $(this).toggleClass('transparent'); });
    },
    
    gotoLink: function (targeturl) {
        window.location.href = targeturl;
    },
    
    traceObject: function(obj) {
        for (var key in obj) {
            log(key + ': ' + obj[key]);
        }
    },

    setTitle: function(title) {
        document.title = title;
    },
    
    getRandomNumber: function(range) {
        return Math.floor(Math.random() * range) + 1;
    }
}


