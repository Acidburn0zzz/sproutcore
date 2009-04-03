// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/data_source');

/** @class

  A cascading data source will actually forward requests onto an array of 
  additional data sources, stopping when one of the data sources returns YES,
  indicating that they handled the request.  
  
  You can use a cascading data source to tie together multiple data sources,
  treating them as a single namespace.
  
  @extends SC.DataSource
  @since SproutCore 1.0
*/
SC.CascadeDataSource = SC.DataSource.extend( 
  /** SC.CascadeDataSource.prototype */ {

  /**
    The data sources used by the cascade, in the order that they are to be 
    followed.  Usually when you define the cascade, you will define this
    array.
    
    @property {Array}
  */
  dataSources: [],
  
  // ..........................................................
  // SC.STORE ENTRY POINTS
  // 
  
  _handleResponse: function(current, response) {
    if (response === YES) return YES ;
    if (current === NO) return response === NO ? NO : SC.MIXED_STATE ;
  },
  
  /** @private - just cascades */
  retrieveRecords: function(dataSource, store, storeKeys) {
    var sources = this.get('dataSources'), len = sources.length;
    var source, idx, ret = null, cur;
    
    for(idx=0;idx<len;idx++) {
      source = sources.objectAt(idx);
      cur = source.retrieveRecords.call(this, store, storeKeys);
      ret = this._handleResponse(ret, cur);
      if (ret === YES) return YES ;
    }
    
    if (ret === null) ret = NO ;
    return ret ;
  },

  /** @private - just cascades */
  commitRecords: function(dataSource, store, createStoreKeys, updateStoreKeys, destroyStoreKeys) {
    var sources = this.get('dataSources'), len = sources.length;
    var source, idx, ret = null, cur;
    
    for(idx=0;idx<len;idx++) {
      source = sources.objectAt(idx);
      cur = source.retrieveRecords.call(this, store, createStoreKeys, updateStoreKeys, destroyStoreKeys);
      ret = this._handleResponse(ret, cur);
      if (ret === YES) return YES ;
    }
    
    if (ret === null) ret = NO ;
    return ret ;
  },
  
  /** @private - just cascades */
  cancel: function(dataSource, store, storeKeys) {
    var sources = this.get('dataSources'), len = sources.length;
    var source, idx, ret = null, cur;
    
    for(idx=0;idx<len;idx++) {
      source = sources.objectAt(idx);
      cur = source.cancel.call(this, store, storeKeys);
      ret = this._handleResponse(ret, cur);
      if (ret === YES) return YES ;
    }
    
    if (ret === null) ret = NO ;
    return ret ;
  }
  
});
