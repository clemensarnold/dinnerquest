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

        if (!dq.constants.DEV) {
            $('[role="debug"]').removeAttr('hidden').addClass('transparent').
            click(function() { $(this).toggleClass('transparent'); }); 
        }        
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

    convertToKG: function(gram) {
        var kg = gram / 1000,
            strg = '';

        // kg = helper.roundNumber(kg, 2);
        log('convert / kg: ' + kg);
        
        strg = kg.toString();

        if (strg.length > 4) {
            strg = strg.substring(0,4);
        }

        strg = strg.replace('.',',');

        return strg;
    },
    
    isInArray: function(arg, ary) {
        
        //log('isInArray');
        //log(ary);
        //log(arg);
        
        for (var i = 0; i < ary.length; i++) {
            
            if (ary[i] === arg) {
                //log('found');
                return true;
            }
        }
        
        return false;
    },
    
    getRandomNumber: function(range) {
        return Math.floor(Math.random() * range) + 0;
    },
    
    roundNumber: function(num, digits) {
        var rounded = Math.round(num * digits) / digits;
        return rounded;
    },

    setFbLink: function($target, url) {
        
        url += '?rid=' + Math.random();
        
        //var facebook_url = 'http://www.facebook.com/sharer.php?u=' + encodeURIComponent(url);
        var facebook_url = 'http://www.facebook.com/sharer.php?u=' + url;
        
        //log('url: ' + url);
        // log('facebook_url: ' + facebook_url);
        
        //var facebook_url = 'http://www.facebook.com/sharer.php?'+ 'u=' + encodeURIComponent('http://google.com/?q=bla');                        
        $target.attr('href', facebook_url);
    },
}


var docCookies = {
  getItem: function (sKey) {
    if (!sKey) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    if (!sKey) { return false; }
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};