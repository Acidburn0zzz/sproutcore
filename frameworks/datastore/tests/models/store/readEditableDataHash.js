// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey, json;
module("SC.Store#readEditableDataHash", {
  setup: function() {
    store = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey = SC.Store.generateStoreKey();

    store.writeDataHash(storeKey, json, SC.Record.READY_CLEAN);
    store.commitChanges();
  }
});

test("reading unmodified record from root store", function() {
  ok(!store.locks || !store.locks[storeKey], 'precond - no lock yet on record');
  ok(!store.editables || !store.editables[storeKey], 'preccond - record should not be editable yet');
  
  var result = store.readEditableDataHash(storeKey);
  ok(result !== json, 'should not return same json instance');
  same(result, json, 'new data hash should be a clone of original');
  
  ok(store.locks[storeKey], 'should add a lock');
  ok(store.dataHashes.hasOwnProperty(storeKey), 'should copy reference to json');
  ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');

  ok(store.editables && store.editables[storeKey], 'should mark item as editable');
  
  ok(!store.chainedChanges || (store.chainedChanges.indexOf(storeKey)<0), 'chainedChanges should not include storeKey since it has not technically changed yet');
});

test("should return null when accessing an unknown storeKey", function() {
  equals(store.readEditableDataHash(20000000), null, 'shuld return null for non-existant store key');
});

test("reading unmodified record from chained store", function() {
  var parent = store;
  store = parent.chain();

  ok(!store.locks || !store.locks[storeKey], 'precond - no lock yet on record');
  ok(!store.dataHashes.hasOwnProperty(storeKey), 'precond - record is currently inherited from parent store');
  ok(!store.statuses.hasOwnProperty(storeKey), 'precond - record is currently inherited from parent store');
  
  var result = store.readEditableDataHash(storeKey);
  ok(result !== json, 'should not return same json instance');
  same(result, json, 'new data hash should be a clone of original');

  ok(store.locks[storeKey], 'should add a lock');
  ok(store.dataHashes.hasOwnProperty(storeKey), 'should copy reference to json');
  ok(store.statuses.hasOwnProperty(storeKey), 'should copy reference to status');
  ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');

  ok(store.editables && store.editables[storeKey], 'should mark item as editable');
    
  ok(!store.chainedChanges || (store.chainedChanges.indexOf(storeKey)<0), 'chainedChanges should not include storeKey since it has not technically changed yet');
});
