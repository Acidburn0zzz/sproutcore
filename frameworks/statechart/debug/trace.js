// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/init') ;
sc_require('system/dispatch') ;

var _sc_log = function(text) {
  console.log(text) ;
  if (StatechartDebugger) {
    this.set('sc_lastMessage', text) ;
  }
};

var _sc_alert = function(text) {
  console.log(text) ;
  alert(text) ;
};

SC.mixin(SC.Object.prototype,
/** SC.Object.prototype */ {
  
  /** @private
    Sends an event to the given state. This method is overriden in debug mode 
    to implement state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES, SC.EVT_TRANSITION_RES, or undefined}
  */
  _sc_statechart_initStatechart: function() {
    if (this.get('sc_trace')) {
      var fun = this.get('sc_singleStep') ? _sc_alert : _sc_log ;
      fun.call(this, "%@:initStatechart()".fmt(this)) ;
    }
  },
  
  /** @private
    Sends an event to the given state. This method is overriden in debug mode 
    to implement state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES, SC.EVT_TRANSITION_RES, or undefined}
  */
  _sc_statechart_dispatch: function(evt) {
    if (this.get('sc_trace')) {
      if (evt.sig.match(/^mouse+/) && !StatechartDebugger.LOG_MOUSE_EVENTS) return ;
      
      var fun = this.get('sc_singleStep') ? _sc_alert : _sc_log ;
      fun.call(this, "%@:dispatch()".fmt(this)) ;
    }
  },
  
  /** @private
    Enters a given state. This method is overriden in debug mode to implement
    state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES or undefined}
  */
  _sc_statechart_enter: function(state) {
    var depth = this._sc_state_depth++ ;
    
    var pre = '' ;
    while (--depth >= 0) pre = pre + '  ' ;
    
    if (this.get('sc_trace')) {
      var fun = this.get('sc_singleStep') ? _sc_alert : _sc_log ;
      fun.call(this, pre + "-> entering \"" + state + '"') ;
    }
    return this[state](SC.EVT_ENTER) ;
  },
  
  /** @private
    Exits a given state. This method is overriden in debug mode to implement
    state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES or undefined}
  */
  _sc_statechart_exit: function(state) {
    var depth = this._sc_state_depth-- ;
    
    var pre = '' ;
    while (--depth > 0) pre = pre + '  ' ;
    
    if (this.get('sc_trace')) {
      var fun = this.get('sc_singleStep') ? _sc_alert : _sc_log ;
      fun.call(this, pre + "<- leaving  \"" + state + '"') ;
    }
    return this[state](SC.EVT_EXIT) ;
  },
  
  /** @private
    Inits a given state. This method is overriden in debug mode to implement
    state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_TRANSITION_RES or undefined}
  */
  _sc_statechart_init: function(state) {
    var depth = this._sc_state_depth ;
    
    var pre = '' ;
    while (--depth > 0) pre = pre + '  ' ;
    
    var res = this[state](SC.EVT_INIT), stateKey = this.get('stateKey') ;
    if (this.get('sc_trace') && res === SC.EVT_TRANSITION_RES) {
      var fun = this.get('sc_singleStep') ? _sc_alert : _sc_log ;
      fun.call(this, pre + "  (taking default transition to \"" + this[stateKey] + '")') ;
    }
    return res ;
  },
  
  /** @private
    Sends an event to the given state. This method is overriden in debug mode 
    to implement state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES, SC.EVT_TRANSITION_RES, or undefined}
  */
  _sc_statechart_event: function(state, evt, depth) {
    if (evt.sig.match(/^mouse+/) && !StatechartDebugger.LOG_MOUSE_EVENTS) return ;
    
    var pre = '' ;
    while (--depth > 0) pre = pre + '  ' ;
    
    var res = this[state](evt), stateKey = this.get('stateKey') ;
    if (this.get('sc_trace')) {
      var fun = this.get('sc_singleStep') ? _sc_alert : _sc_log ;
      var chr ;
      var sig = (evt.sig === 'keyDown' && (chr = evt.getCharString())) ? '%@(%@)'.fmt(evt.sig, chr) : evt.sig ;
      if (res) {
        if (res === SC.EVT_HANDLED_RES) {
          fun.call(this, pre + '"' + state + '" handled event \'' + sig + '\' (no transition)') ;
        } else if (res === SC.EVT_TRANSITION_RES) {
          fun.call(this, pre + '"' + state + '" handled event \'' + sig + '\' with a transition to \"' + this[stateKey] + '"') ;
        }
      } else fun.call(this, pre + '"' + state + '" ignored event \'' + sig + "'") ;
    }
    return res ;
  }
  
});
