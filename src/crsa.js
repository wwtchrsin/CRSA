var CRSA = function(container) {
    'use strict';
    var self = this;
    var styles = {};
    var rollback = {};
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
        if ( width !== dimensions.cw || height !== dimensions.ch || !stylesApplied )
            self.defineDimensions(width, height);
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
    var rollbackStyles = function() {
        for ( var selector in rollback ) for ( var attr in rollback[selector] )
            for ( var i=0; i < rollback[selector][attr].elements.length; i++ ) {
                var element = rollback[selector][attr].elements[i];
                var value = rollback[selector][attr].values[i];
                if ( element ) element.style[attr] = value;
            }
    };
    var refresh = function() {
        if ( !container ) return;
        rollbackStyles();
        for ( var selector in styles ) {
            var elements = container.querySelectorAll(selector);
            if ( !elements.length ) elements = document.querySelectorAll(selector);
            for ( var attr in styles[selector] ) {
                if ( elements.length ) {
                    var abstractValue = styles[selector][attr];
                    var value = abstractValue.replace(pattern, transformer);
                    for ( var i=0; i < elements.length; i++ ) {
                        var elementStyles = elements[i].style;
                        rollback[selector][attr].elements[i] = elements[i];
                        rollback[selector][attr].values[i] = elementStyles[attr];
                        elementStyles[attr] = value;
                    }
                }
                var targetSize = elements.length;
                var sizeDelta = rollback[selector][attr].elements.length - targetSize;
                if ( sizeDelta > 0 ) {
                    rollback[selector][attr].elements.splice(targetSize, sizeDelta);
                    rollback[selector][attr].values.splice(targetSize, sizeDelta);
                }
            }
        }
        stylesApplied = true;
    };
    this.defineStyles = function(object) {
        if ( !(object && typeof object === "object") ) return;
        if ( stylesDefined ) rollbackStyles();
        styles = {};
        rollback = {};
        for ( var selector in object ) {
            styles[selector] = {};
            rollback[selector] = {};
            for ( var attr in object[selector] ) {
                rollback[selector][attr] = { elements: [], values: [] };
                styles[selector][attr] = object[selector][attr];
            }
        }
        stylesDefined = true;
        if ( dimensionsDefined ) refresh();
        return self;
    };
    this.defineContainer = function(element) {
        if ( typeof element === "string" )
            element = document.querySelector(element);
        container = ( element instanceof HTMLElement ) ? element : null;
        stylesApplied = false;
        dimensionsDefined = false;
        if ( stylesDefined && container ) refresh();
        if ( stylesDefined && !container ) rollbackStyles();
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