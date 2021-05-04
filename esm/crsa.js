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
    var autoRefreshDisabled = false;
    var uncondRI = 1e+12;
    var autoRI = 250;
    var resizeRI = -1;
    var lastRefresh = -autoRI;
    var autoRTID = null;
    var autoRRAFID = null;
    var uncondRTID = null;
    var uncondRRAFID = null;
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
    var uncondRefresh, autoRefresh;
    var clearTimeouts = function(refreshType) {
        if ( refreshType === "u" || !refreshType ) {
            if ( uncondRRAFID !== null ) cancelAnimationFrame(uncondRRAFID);
            if ( uncondRTID !== null ) clearInterval(uncondRTID);
            uncondRRAFID = null; 
            uncondRTID = null;
        }
        if ( refreshType === "a" || !refreshType ) {
            if ( autoRRAFID !== null ) cancelAnimationFrame(autoRRAFID);
            if ( autoRTID !== null ) clearInterval(autoRTID);
            autoRRAFID = null; 
            autoRTID = null;
        }
    };
    var setTimeouts = function(refreshType) {
        if ( autoRefreshDisabled ) return;
        clearTimeouts(refreshType);
        if ( refreshType === "u" || !refreshType ) {
            if ( uncondRI > 0 && uncondRI < 1e+12 ) uncondRTID = setTimeout(uncondRefresh, uncondRI);
            if ( uncondRI <= 0 ) uncondRRAFID = requestAnimationFrame(uncondRefresh);
        }
        if ( (refreshType === "a" || !refreshType) && (uncondRI > 0 && autoRI < uncondRI) ) {
            if ( autoRI > 0 ) autoRTID = setTimeout(autoRefresh, autoRI);
            else autoRRAFID = requestAnimationFrame(autoRefresh);
        }
    };
    var autoRefreshGeneral = function(refreshType) {
        setTimeouts(refreshType);
        if ( !container || !container.getBoundingClientRect ) return;
        var newDimensions = container.getBoundingClientRect();
        if ( !newDimensions ) return;
        var width = newDimensions.right - newDimensions.left;
        var height = newDimensions.bottom - newDimensions.top;
        if ( !width || !height ) return;
        var redefine = width !== dimensions.cw || height !== dimensions.ch;
        redefine = redefine || !stylesApplied || (refreshType === "u");
        if ( redefine ) self.defineDimensions(width, height);
    };
    var onResize = function() {
        if ( container && stylesDefined ) {
            var timestamp = performance.now();
            var delta = timestamp - lastRefresh;
            if ( delta >= resizeRI ) autoRefresh();
        }
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
        setTimeouts();
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
        lastRefresh = performance.now();
    };
    self.defineStyles = function(object) {
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
        if ( dimensionsDefined && container ) refresh();
        if ( !dimensionsDefined && container ) self.refresh();
        return self;
    };
    self.defineContainer = function(element) {
        if ( typeof element === "string" )
            element = document.querySelector(element);
        container = ( element instanceof HTMLElement ) ? element : null;
        stylesApplied = false;
        dimensionsDefined = false;
        if ( stylesDefined && container ) self.refresh();
        if ( stylesDefined && !container ) rollbackStyles();
        return self;
    };
    self.defineDimensions = function(width, height) {
        dimensionsDefined = true;
        dimensions.cw = width;
        dimensions.ch = height;
        dimensions.cmin = Math.min(width, height);
        dimensions.cmax = Math.max(width, height);
        dimensions.cavg = Math.floor(Math.sqrt(width * height));
        refresh();
        return self;
    };
    self.enableAutoRefresh = function() {
        if ( arguments.length > 0 ) resizeRI = arguments[0];
        if ( arguments.length > 1 ) autoRI = arguments[1];
        if ( arguments.length > 2 ) uncondRI = arguments[2];
        autoRefreshDisabled = false;
        uncondRefresh();
        if ( autoRI < 0 || uncondRI < 0 ) window.removeEventListener("resize", onResize);
        else window.addEventListener("resize", onResize);
        return self;
    };
    self.disableAutoRefresh = function() {
        clearTimeouts();
        window.removeEventListener("resize", onResize);
        autoRefreshDisabled = true;
        return self;
    };
    self.refresh = function() {
        if ( !container || !container.getBoundingClientRect ) return self;
        if ( !stylesDefined ) return self;
        var newDimensions = container.getBoundingClientRect();
        if ( !newDimensions ) return self;
        var width = newDimensions.right - newDimensions.left;
        var height = newDimensions.bottom - newDimensions.top;
        self.defineDimensions(width, height);
        return self;
    };
    (function() {
        autoRefresh = autoRefreshGeneral.bind(null, "a");
        uncondRefresh = autoRefreshGeneral.bind(null, "u");
        self.defineContainer(container);
        window.addEventListener("resize", onResize);
    })();
};
export default CRSA;