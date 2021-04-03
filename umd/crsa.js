(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CRSA = factory();
    }
})(this, function() {
'use strict';
var CRSA = function(container) {
    'use strict';
	var self = this;
    var styles = {};
    var dimensionsDefined = false;
    var stylesDefined = false;
    var stylesApplied = false;
    var dimensions = {
        cmin: 0,
        cmax: 0,
        cavg: 0,
        cw: 0,
        ch: 0,
    };
    var pattern = /(\d+)(cmin|cmax|cavg|cw|ch)/g;
    var transformer = function(match, value, type) {
        return Math.floor(0.01 * +value * dimensions[type]) + "px";
    };
    var refreshInterval = 250;
    var resizeInterval = -1;
    var lastResize = -refreshInterval;
    var autoRefreshTID = null;
    var autoRefreshRAFID = null;
    var requestAnimationFrame = window.requestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame;
    if ( !requestAnimationFrame || !cancelAnimationFrame ) {
        requestAnimationFrame = function(callback) {
            return setTimeout(callback, 16);
        };
        cancelAnimationFrame = function(tid) {
            clearTimeout(tid);
        };
    }
    var autoRefresh = function() {
        if ( refreshInterval > 0 ) autoRefreshRAFID = null;
        else autoRefreshRAFID = requestAnimationFrame(autoRefresh);
        if ( refreshInterval > 0 && autoRefreshTID === null )
            autoRefreshTID = setInterval(autoRefresh, refreshInterval);
        if ( !container || !container.getBoundingClientRect ) return;
        var newDimensions = container.getBoundingClientRect();
        if ( !newDimensions ) return;
        var width = newDimensions.right - newDimensions.left;
        var height = newDimensions.bottom - newDimensions.top;
        if ( !width || !height ) return;
        ( width !== dimensions.cw || height !== dimensions.ch || !stylesApplied )
            && self.defineDimensions(width, height);
    };
    var onResize = function() {
        if ( resizeInterval < 0 ) {
            if ( autoRefreshRAFID !== null ) return;
            if ( autoRefreshTID !== null ) clearInterval(autoRefreshTID);
            autoRefreshRAFID = requestAnimationFrame(autoRefresh);
            autoRefreshTID = null;
            return;
        }
        var timestamp = performance.now();
        var delta = timestamp - lastResize;
        if ( delta >= resizeInterval ) autoRefresh();
        lastResize = timestamp;
    };
    var restoreDefaultStyles = function(container) {
        if ( !container ) return;
        for ( var selector in styles ) {
            var element = container.querySelector(selector);
            if ( !element ) element = document.querySelector(selector);
            if ( !element ) continue;
            element = element.style;
            for ( var attr in styles[selector] ) {
                var defaultValue = styles[selector][attr].defval;
                element[attr] = defaultValue;
            }
        }
    };
    var saveDefaultStyles = function(container) {
        if ( !container ) return;
        for ( var selector in styles ) {
            var element = container.querySelector(selector);
            if ( !element ) element = document.querySelector(selector);
            if ( !element ) continue;
            element = element.style;
            for ( var attr in styles[selector] ) {
                var defaultValue = element[attr];
                styles[selector][attr].defval = defaultValue;
            }
        }
    };
    var refresh = function() {
        if ( !container ) return;
        for ( var selector in styles ) {
            var element = container.querySelector(selector);
            if ( !element ) element = document.querySelector(selector);
            if ( !element ) continue;
            element = element.style;
            for ( var attr in styles[selector] ) {
                var abstractValue = styles[selector][attr].value;
                var value = abstractValue.replace(pattern, transformer);
                element[attr] = value;
            }
        }
        stylesApplied = true;
    };
    this.defineStyles = function(object) {
        if ( !(object && typeof object === "object") ) return;
        if ( container ) restoreDefaultStyles(container);
        styles = {};
        for ( var selector in object ) {
            styles[selector] = {};
            for ( var attr in object[selector] ) {
                styles[selector][attr] = {
                    value: object[selector][attr],
                    defval: undefined,
                }
            }
        }
        stylesDefined = true;
        if ( container ) saveDefaultStyles(container);
        if ( dimensionsDefined ) refresh();
        return self;
    };
    this.defineContainer = function(element) {
        if ( container ) restoreDefaultStyles(container);
        if ( typeof element === "string" )
            element = document.querySelector(element);
        container = ( element instanceof HTMLElement )
            ? element
            : null;
        stylesApplied = false;
        dimensionsDefined = false;
        if ( container ) saveDefaultStyles(container);
        if ( stylesDefined ) refresh();
        return self;
    };
    this.defineDimensions = function(width, height) {
        dimensionsDefined = true;
        dimensions.cw = width;
        dimensions.ch = height;
        dimensions.cmin = Math.min(width, height);
        dimensions.cmax = Math.max(width, height);
        dimensions.cavg = Math.floor(Math.sqrt(width * height));
        refresh();
        return self;
    };
    this.enableAutoRefresh = function() {
        if ( arguments.length > 0 ) resizeInterval = arguments[0];
        if ( arguments.length > 1 ) refreshInterval = arguments[1];
        if ( autoRefreshTID !== null ) clearInterval(autoRefreshTID);
        if ( autoRefreshRAFID !== null ) cancelAnimationFrame(autoRefreshRAFID);
        autoRefreshTID = null;
        autoRefreshRAFID = null;
        if ( refreshInterval <= 0 ) {
            autoRefreshRAFID = requestAnimationFrame(autoRefresh);
            window.removeEventListener("resize", onResize);
        } else {
            autoRefreshTID = setInterval(autoRefresh, refreshInterval);
            window.addEventListener("resize", onResize);
            autoRefresh();
        }
        return self;
    };
    this.disableAutoRefresh = function() {
        if ( autoRefreshTID !== null ) clearInterval(autoRefreshTID);
        if ( autoRefreshRAFID !== null ) cancelAnimationFrame(autoRefreshRAFID);
        autoRefreshTID = null;
        autoRefreshRAFID = null;
        window.removeEventListener("resize", onResize);
        return self;
    };
    (function() { self.defineContainer(container); })();
};
return CRSA;
});