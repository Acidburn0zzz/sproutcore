// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey1, storeKey2, json;
module("SC.Store#removeDataHash", {
  setup: function() {
    store = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey1 = SC.Store.generateStoreKey();
    storeKey2 = SC.Store.generateStoreKey();

    // write existing record
    store.writeDataHash(storeKey1, json, SC.Record.BUSY_LOADING);
    store.commitChanges();
  }
});

test("removing existing data hash", function() {
  ok(store.dataHashes[storeKey1], 'precond - has data');
  ok(store.statuses[storeKey1], 'precond - has status');
  ok(store.statuses[storeKey1] !== SC.RECORD_EMPTY, 'precond - status is not RECORD_EMPTY');
  var oldrev = store.revisions[storeKey1];
  
  store.removeDataHash(storeKey1);

  // verify internals before doing read which could muck with them
  equals(store.dataHashes[storeKey1], null, 'dataHash should be null');
  equals(store.statuses[storeKey1], SC.RECORD_EMPTY, 'store.statuses should be SC.RECORD_EMPTY');
  equals(store.revisions[storeKey1], oldrev, 'revision should not change');
  ok(store.locks[storeKey1], 'should have lock');
  ok(!store.editables || !store.editables[storeKey1], 'should not be marked editable');
  ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey1), 'changedDataHashes should not include hash yet');
  
  // verify high level round trip
  equals(store.readDataHash(storeKey1), null, 'readDataHash() should return null');
});

test("removing edited data hash", function() {
  
  // edit the data hash first.
  store.writeDataHash(storeKey1, {});

  // now do the same basic test...
  ok(store.dataHashes[storeKey1], 'precond - has data');
  ok(store.statuses[storeKey1], 'precond - has status');
  ok(store.statuses[storeKey1] !== SC.RECORD_EMPTY, 'precond - status is not RECORD_EMPTY');
  var oldrev = store.revisions[storeKey1];
  
  store.removeDataHash(storeKey1);

  // verify internals before doing read which could muck with them
  equals(store.dataHashes[storeKey1], null, 'dataHash should be null');
  equals(store.statuses[storeKey1], SC.RECORD_EMPTY, 'store.statuses should be SC.RECORD_EMPTY');
  equals(store.revisions[storeKey1], oldrev, 'revision should not change');
  ok(store.locks[storeKey1], 'should have lock');
  ok(!store.editables || !store.editables[storeKey1], 'should not be marked editable');
  ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey1), 'changedDataHashes should not include hash yet');
  
  // verify high level round trip
  equals(store.readDataHash(storeKey1), null, 'readDataHash() should return null');

});


test("removing non-existant data hash should do nothing", function() {

  ok(!store.dataHashes[storeKey2], 'precond - has no data');
  ok(!store.statuses[storeKey2], 'precond - has no status');
  ok(!store.revisions[storeKey2], 'still has no revisions');
  ok(!store.locks || !store.locks[storeKey2], 'precond - has no lock');
  
  store.removeDataHash(storeKey2);

  ok(!store.dataHashes[storeKey2], 'still has no data');
  ok(!store.statuses[storeKey2], 'still has no status');
  ok(!store.revisions[storeKey2], 'still has no revisions');
  ok(!store.locks || !store.locks[storeKey2], 'still has no lock');

});