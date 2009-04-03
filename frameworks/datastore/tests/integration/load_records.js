// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

var MyApp = {};



MyApp = SC.Object.create();
MyApp.store = SC.Store.create();
MyApp.persistentStore = SC.PersistentStore.create();
MyApp.Author = SC.Record.extend();
MyApp.persistentStore.addInMemoryStore(MyApp.store); //.set('parentStore', MyApp.persistentStore);

module("SC.Store", {
  
    setup: function() {
    }
  }

);

test("Basic Requirements", function() {
  ok(MyApp, "MyApp is defined") ;
  ok(MyApp.store, "MyApp.store is defined") ;
  ok(MyApp.persistentStore, "MyApp.persistentStore is defined") ;
  ok(MyApp.Author, "MyApp.Author is defined") ;
  ok(json0_9, "json0_9 is defined") ;
  ok(json10_19, "json10_19 is defined") ;
  ok(json20_29, "json20_29 is defined") ;
  ok(json30_39, "json30_39 is defined") ;
  ok(json40_49, "json40_49 is defined") ;
});



test("set parentStore property on MyApp.store to MyApp.peristentStore", function() {
  var ret = MyApp.store.set('parentStore', MyApp.persistentStore);
  ok(MyApp.persistentStore === MyApp.store.get('parentStore'), "MyApp.persistentStore should === MyApp.store.get('parentStore')" ) ;
});

test("MyApp.store sees that parentStore is persistent", function() {
  equals(YES, MyApp.store.get('parentStore').get('isPersistent')) ;
});

test("MyApp.peristentStore sees its inMemoryStore is MyApp.store", function() {
  ok(MyApp.persistentStore.get('inMemoryStore') === MyApp.store, ".MyApp.persistentStore.get('inMemoryStore') should === MyApp.store" ) ;
});

test("loadRecords: call loadRecords(json0_9, MyApp.Author), should return array with 10 unique storeKeys 0-9", function() {
  var ret = MyApp.store.loadRecords(json0_9, MyApp.Author);
  var expected = [0,1,2,3,4,5,6,7,8,9];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: call loadRecords(json10_19, MyApp.Author, 'guid'), should return array with 10 unique storeKeys 10-19", function() {
  var ret = MyApp.store.loadRecords(json10_19, MyApp.Author, 'guid');
  var expected = [10,11,12,13,14,15,16,17,18,19];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: call loadRecords(json20_29, [MyApp.Author,...,MyApp.Author]), should return array with 10 unique storeKeys 20-29", function() {
  var recordTypes = [MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author];
  var ret = MyApp.store.loadRecords(json20_29, recordTypes);
  var expected = [20,21,22,23,24,25,26,27,28,29];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value  " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: call loadRecords(json30_39, [MyApp.Author,...,MyApp.Author], 'guid'), should return array with 10 unique storeKeys 30-39", function() {
  var recordTypes = [MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author];
  var ret = MyApp.store.loadRecords(json30_39, recordTypes, 'guid');
  var expected = [30,31,32,33,34,35,36,37,38,39];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: call loadRecords(json40_49), should return array with 10 unique storeKeys 40-49", function() {
  var ret = MyApp.store.loadRecords(json40_49);
  var expected = [40,41,42,43,44,45,46,47,48,49];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value  " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: check recKeyTypeMap for correctness. Expect 40 MyApp.Author types and 10 SC.Record types.", function() {
  var ret = MyApp.store.recKeyTypeMap;
  
  for(var i=0; i<40; i++) {
    ok(ret[i] === MyApp.Author, ("storeKey " + i + " is of type MyApp.Author"));
  }
  
  for(var i=40; i<50; i++) {
    ok(ret[i] === SC.Record, ("storeKey " + i + " is of type SC.Record"));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: check dataTypeMap for correctness. Expect 40 MyApp.Author types and 10 SC.Record types.", function() {
  var map = MyApp.store.dataTypeMap;
  
  var type1 = map[SC.guidFor(MyApp.Author)];
  var type2 = map[SC.guidFor(SC.Record)];
  
  ok(type1, "MyApp.Author is defined in the dataTypeMap.");
  ok(type2, "SC.Record is defined in the dataTypeMap.");
  
  var expected1 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39];
  var expected2 = [40,41,42,43,44,45,46,47,48,49];
  
  for(var i=0; i<40; i++) {
    ok(type1[i] === expected1[i], ("storeKey returned for type MyApp.Author at index " + i + ":  "+type1[i]+" equal to expected value " +expected1[i]));
  }
  
  for(var i=0; i<10; i++) {
    ok(type2[i] === expected2[i], ("storeKey returned for type SC.Record at index " + i + ":  "+type2[i]+" equal to expected value " +expected2[i]));
  }
});

test("loadRecords: check revisions for correctness. All revisions should be 0", function() {
  var rev = MyApp.store.revisions;
    
  var expected = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49];
  
  for(var i=0; i<50; i++) {
    ok(rev[i] === 0, ("revision returned for storeKey at index " + i + " is "+rev[i]+"."));
  }
  
});

test("loadRecords: simulate update from server.", function() {
  var rev = MyApp.store.revisions;
  var hash = MyApp.store.dataHashes;

  var json = [
    {"type": "Author", "guid": "4995bc653acad","fullName": "Billy Bob", "bookTitle": "The Death Doors", "address":" UC Santa Cruz, 35 First St, Wichita, KS"},
    {"type": "Author", "guid": "4995bc653acfe","fullName": "Billy Joe", "bookTitle": "The Fear of the Thieves", "address":" Michigan State University, 285 Lazaneo St, Ann Arbor, MI"},
  ];
  
  var ret = MyApp.store.loadRecords(json, MyApp.Author, 'guid');

  ok(ret[0] === 0, "ret[0] from loadRecords is storeKey 0");
  ok(hash[0].fullName == "Billy Bob" , "dataHash at storeKey 0 has new fullName set to 'Billy Bob'");
  ok(rev[0] === 1, "revision at storeKey 0 has revision 1");

  ok(ret[1] === 1, "ret[0] from loadRecords is storeKey 0");
  ok(hash[1].fullName == "Billy Joe" , "dataHash at storeKey 0 has new fullName set to 'Billy Joe'");
  ok(rev[1] === 1, "revision at storeKey 1 has revision 1");
  
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "no persistentChanges.updated should have been recorded."); 
});

test("materialization: find record with command  MyApp.store.find('4995bc653adad')", function() {
  var record = MyApp.store.find('4995bc653adad');
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == 'Milburn Holdeman 2', "record.get('fullName') should equal 'Milburn Holdeman 2'");
  ok(record.get(record.primaryKey) == '4995bc653adad', "record.get(record.primaryKey) should equal '4995bc653adad'");
  ok(record.get('guid') == '4995bc653adad', "record.get('guid') should equal '4995bc653adad'");
  ok(record._storeKey === 8, "record._storeKey should equal 8");

  var rec = MyApp.store.find('4995bc653adad');
  ok(rec === record, "find again, var rec = MyApp.store.find('4995bc653adad'). rec should === record");
});

test("materialization: find record with command  MyApp.Author.find('4995bc653adc4', MyApp.store)", function() {
  var record = MyApp.Author.find('4995bc653adc4', MyApp.store);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == 'Martina Read 4', "record.get('fullName') should equal 'Martina Read 4'");
  ok(record.get(record.primaryKey) == '4995bc653adc4', "record.get(record.primaryKey) should equal '4995bc653adc4'");
  ok(record.get('guid') == '4995bc653adc4', "record.get('guid') should equal '4995bc653adc4'");
  ok(record._storeKey === 9, "record._storeKey should equal 9");

  var rec = MyApp.Author.find('4995bc653adc4', MyApp.store);
  ok(rec === record, "find again, var rec = MyApp.Author.find('4995bc653adc4'). rec should === record");
});

test("materialization: find unknown record with command MyApp.store.find('123') should fault and return null.", function() {
  var record = MyApp.store.find('123');
  ok(record === null, "record returned should equal null");
});

test("materialization: find record with command  MyApp.store.find('123', MyApp.Author) should fault and get data from server.", function() {
  var record = MyApp.store.find('123', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record._storeKey === 50, "record._storeKey should equal 50");
  ok(record.get('guid') === null, "record.get('guid') should === null");
  ok(record.get('status') === RECORD_LOADING, "record.get('status') should === RECORD_LOADING");
  
  MyApp.persistentStore.simulateResponseFromServer('123');
  
  ok(record.get('guid') === '123', "record.get('guid') should === '123'");
  ok(record.get('status') === RECORD_LOADED, "record.get('status') should === RECORD_LOADED");
  ok(record.get('fullName') === 'Mr. From Server', "record.get('fullName') should === 'Mr. From Server'");
  ok(record._storeKey === 50, "record._storeKey should equal 50");
  ok(MyApp.store.revisions[50] === 0, "revision should equal 0");

});

test("record: materialize guid='4995bc653ae78', test using set() on record without beginEditing() call. then commitChanges on store.", function() {
  var record = MyApp.store.find('4995bc653ae78', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Erskine Aultman 2", "record.get('fullName') should equal 'Erskine Aultman 2'");

  ok(MyApp.store.revisions[record._storeKey] === 0, "Before editing record, revision in store should be 0.");

  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 1, "After first edit, revision in store should be 1. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

  record.set('fullName', 'Bobby Jones');
  ok(record.get('fullName') == "Bobby Jones", "record.set('fullName', 'Bobby Jones'), fullName should equal 'Bobby Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 2, "After second edit, revision in store should be 2. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

  ok(MyApp.store.changes.length == 2, "BEFORE commit, 2 changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 2, "BEFORE commit, 2 persistentChanges.updated should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 

  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: materialize guid='4995bc653af24', test using set() on record WITH beginEditing() and endEditing() calls. then commitChanges store.", function() {
  var record = MyApp.store.find('4995bc653af24', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Hailey Berkheimer 3", "record.get('fullName') should equal 'Hailey Berkheimer 3'");

  ok(MyApp.store.revisions[record._storeKey] === 0, "Before editing record, revision in store should be 0.");

  record.beginEditing();
  
  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");
  ok(record._editLevel === 1, "after a set operation with explicit beginEditing(), _editLevel should be to 1. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 0, "After first edit, revision in store should be 0. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

  record.set('fullName', 'Bobby Jones');
  ok(record.get('fullName') == "Bobby Jones", "record.set('fullName', 'Bobby Jones'), fullName should equal 'Bobby Jones'");
  ok(record._editLevel === 1, "after a set operation with explicit beginEditing(), _editLevel should be to 1. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 0, "After second edit, revision in store should be 0. ACTUAL: " + MyApp.store.revisions[record._storeKey]);
  
  record.endEditing();

  ok(MyApp.store.revisions[record._storeKey] === 1, "AFTER calling record.endEditing(), revision in store should be 1. ACTUAL: " + MyApp.store.revisions[record._storeKey]);
  ok(record._editLevel === 0, "AFTER calling record.endEditing() with explicit beginEditing(), _editLevel should be to 0. ACTUAL: " + record._editLevel);

  
  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 1, "BEFORE commit, 1 persistentChanges.updated should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 


  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: materialize guid='4995bc653b043', test using set() on record without beginEditing() call. then discardChanges on store.", function() {
  var record = MyApp.store.find('4995bc653b043', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Clitus Mccallum 2", "record.get('fullName') should equal 'Clitus Mccallum 2'");

  ok(MyApp.store.revisions[record._storeKey] === 0, "Before editing record, revision in store should be 0.");

  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 1, "After first edit, revision in store should be 1. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

  record.set('fullName', 'Bobby Jones');
  ok(record.get('fullName') == "Bobby Jones", "record.set('fullName', 'Bobby Jones'), fullName should equal 'Bobby Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 2, "After second edit, revision in store should be 2. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

  ok(MyApp.store.changes.length == 2, "BEFORE discard, 2 changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 2, "BEFORE discard, 2 persistentChanges.updated should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE discard, hasChanges property on store is set to YES."); 

  var success = MyApp.store.discardChanges();

  ok(success == NO, "AFTER discard, NO should be returned to signify error because you're in a store that is attached to a persistentStore."); 

  ok(MyApp.store.changes.length == 0, "AFTER discard and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER discard and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER discard and reset, hasChanges property on store is set to NO."); 

});

test("record: destroy existing record with guid='4995bc653b043' by calling store.destroyRecords([record]) then commitChanges.", function() {
  var record = MyApp.store.find('4995bc653b043', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Bobby Jones", "record.get('fullName'), fullName should equal 'Bobby Jones'");

  MyApp.store.destroyRecords([record]);

  ok(record.get('fullName') === null, "record.get('fullName'), fullName should equal to null.");

  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 change should have been recorded."); 
  ok(MyApp.store.persistentChanges.deleted.length == 1, "BEFORE commit, 1 persistentChanges.deleted should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 

  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: destroy existing record with guid='4995bc653af24' by calling record.destroy() then commitChanges.", function() {
  var record = MyApp.store.find('4995bc653af24', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Bobby Jones", "record.get('fullName'), fullName should equal 'Bobby Jones'");

  record.destroy();

  ok(record.get('fullName') === null, "record.get('fullName'), fullName should equal to null.");

  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 change should have been recorded."); 
  ok(MyApp.store.persistentChanges.deleted.length == 1, "BEFORE commit, 1 persistentChanges.deleted should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 

  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: destroy existing record with guid='4995bc653ae78' by calling record.destroy() then discardChanges.", function() {
  var record = MyApp.store.find('4995bc653ae78', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Bobby Jones", "record.get('fullName'), fullName should equal 'Bobby Jones'");

  record.destroy();

  ok(record.get('fullName') === null, "record.get('fullName'), fullName should equal to null.");

  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 change should have been recorded."); 
  ok(MyApp.store.persistentChanges.deleted.length == 1, "BEFORE commit, 1 persistentChanges.deleted should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.discardChanges();

  ok(success == NO, "AFTER discard, NO should be returned to signify error because you're in a store that is attached to a persistentStore.");
  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: create new record using MyApp.store.createRecord({fullName: 'John Locke'}, MyApp.Author) then commitChanges. See guid from server.", function() {
  
  var record = MyApp.store.createRecord({fullName: 'John Locke'}, MyApp.Author);

  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "John Locke", "record.get('fullName'), fullName should equal 'John Locke'");
  ok(record.get('guid') == null, "record.get('guid'), guid be equal to null.");

  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 change should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 

  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

  ok(record.get('status') === RECORD_LOADING, "record.get('status') should === RECORD_LOADING");
  ok(record.get('newRecord') === YES, "record.get('newRecord') should === YES");

  MyApp.persistentStore.simulateResponseFromServer(51);

  ok(record.get('fullName') == "John Locke", "record.get('fullName'), fullName should equal 'John Locke'");
  ok(record.get('bookTitle') == "A Letter Concerning Toleration", "record.get('bookTitle'), bookTitle should equal 'A Letter Concerning Toleration'");
  ok(record.get('guid') == "abcdefg", "record.get('guid'), guid should equal 'abcdefg'");
  ok(MyApp.store.primaryKeyMap['abcdefg'] == 51, "MyApp.store.primaryKeyMap['abcdefg'] == 51");
  ok(MyApp.store.storeKeyMap[51] == 'abcdefg', "MyApp.store.storeKeyMap[51] == 'abcdefg'");

  ok(record.get('status') === RECORD_LOADED, "record.get('status') should === RECORD_LOADED");
  ok(record.get('newRecord') === NO, "record.get('newRecord') should === NO");

});

test("chaining: create new chained store off from MyApp.store", function() {
  MyApp.chainedStore = MyApp.store.createChainedStore();
  ok(MyApp.chainedStore.get('parentStore')=== MyApp.store, "MyApp.chainedStore's parentStore should be MyApp.store.");
  ok(MyApp.chainedStore=== MyApp.store.childStores[0], "MyApp.store's first childStore should be MyApp.chainedStore.");
});

test("chaining: new record in chainedStore. commit it, commit parentStore", function() {
  var record = MyApp.chainedStore.createRecord({fullName: 'Jim Locke'}, MyApp.Author);
  
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Jim Locke", "record.get('fullName'), fullName should equal 'Jim Locke'");
  ok(record.get('guid') == null, "record.get('guid'), guid be equal to null.");

  ok(MyApp.chainedStore.dataHashes[52] !== undefined, "created dataHashes should exist with storeKey 52 in chainedStore");
  ok(MyApp.store.dataHashes[52] === undefined, "created dataHashes should NOT exist with storeKey 52 in store");

  ok(MyApp.chainedStore.changes.length == 1, "BEFORE commit, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "BEFORE commit, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length == 0, "BEFORE commit and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "BEFORE commit and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE commit and reset, hasChanges property in parentStore is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length == 0, "AFTER commit, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 0, "AFTER commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER commit, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 0, "BEFORE commit, 0 change  in parentStore should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created in parentStore should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE commit, hasChanges property on parentStore is set to NO."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit of parentStore, YES should be returned to signify success."); 

  MyApp.persistentStore.simulateResponseFromServer(52);

  ok(record.get('fullName') == "Jim Locke", "record.get('fullName'), fullName should equal 'Jim Locke'");
  ok(record.get('bookTitle') == "A Letter Concerning Toleration Part Deux", "record.get('bookTitle'), bookTitle should equal 'A Letter Concerning Toleration Part Deux'");
  ok(record.get('guid') == "abc", "record.get('guid'), guid should equal 'abcdefg'");
  ok(MyApp.store.primaryKeyMap['abc'] == 52, "MyApp.store.primaryKeyMap['abc'] == 52");
  ok(MyApp.store.storeKeyMap[52] == 'abc', "MyApp.store.storeKeyMap[52] == 'abc'");

  ok(record.get('status') === RECORD_LOADED, "record.get('status') should === RECORD_LOADED");
  ok(record.get('newRecord') === NO, "record.get('newRecord') should === NO");

  
  var rec = MyApp.store.find('abc');
  ok(typeof rec === 'object', "check store to see if record is there. rec MyApp.store.find('abc') is of type 'object'");
  ok(rec === record, 'rec from store should be the same object as record from chainedStore');
  
});

test("chaining: new record in chainedStore. commit it, discard parentStore. should cause error", function() {
  var record = MyApp.chainedStore.createRecord({fullName: 'Jim Bob'}, MyApp.Author);
  
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Jim Bob", "record.get('fullName'), fullName should equal 'Jim Bob'");
  ok(record.get('guid') == null, "record.get('guid'), guid be equal to null.");

  ok(MyApp.chainedStore.dataHashes[53] !== undefined, "created dataHashes should exist with storeKey 53 in chainedStore");
  ok(MyApp.store.dataHashes[53] === undefined, "created dataHashes should NOT exist with storeKey 53 in store");

  ok(MyApp.chainedStore.changes.length == 1, "BEFORE commit, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "BEFORE commit, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length == 0, "BEFORE commit and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "BEFORE commit and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE commit and reset, hasChanges property in parentStore is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length == 0, "AFTER commit, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 0, "AFTER commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER commit, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 0, "BEFORE commit, 0 change  in parentStore should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created in parentStore should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE commit, hasChanges property on parentStore is set to NO."); 

  var success = MyApp.store.discardChanges();
  ok(success == NO, "AFTER commit of parentStore, NO should be returned to signify error because it cannot be discarded. Record still remains but not probagated to server."); 
});

test("chaining: new record in chainedStore. discard it, chainedStore restored and record does not exist in chainedStore.", function() {
  var record = MyApp.chainedStore.createRecord({fullName: 'Bill Adama'}, MyApp.Author);
  
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Bill Adama", "record.get('fullName'), fullName should equal 'Bill Adama'");
  ok(record.get('guid') == null, "record.get('guid'), guid be equal to null.");

  ok(MyApp.chainedStore.dataHashes[54] !== undefined, "created dataHashes should exist with storeKey 54 in chainedStore");
  ok(MyApp.store.dataHashes[54] === undefined, "created dataHashes should NOT exist with storeKey 54 in store");

  ok(MyApp.chainedStore.changes.length == 1, "BEFORE discard, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 1, "BEFORE discard, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "BEFORE discard, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length == 0, "BEFORE discard and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "BEFORE discard and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE discard and reset, hasChanges property in parentStore is set to NO."); 

  var success = MyApp.chainedStore.discardChanges();
  ok(success == YES, "AFTER discard of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.dataHashes[54] === undefined, "created dataHash should NOT exist with storeKey 54 in chainedStore");
  ok(MyApp.store.dataHashes[54] === undefined, "created dataHash should NOT exist with storeKey 54 in store");

  ok(MyApp.chainedStore.changes.length == 0, "AFTER discard, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 0, "AFTER discard, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER discard, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 0, "AFTER discard and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "AFTER discard and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER discard and reset, hasChanges property in parentStore is set to NO."); 

});

/*
  
  //load updated dataHash through loadRecord. see updated revisions. Check for no changeset.
  //load updated dataHash array through loadRecord. see updated revisions. Check for no changeset.
  
  //materialize record given one guid. check materialized record for type, datahash, etc.
  //rematerialize record given one guid. check that it is the same record.
  
  //materialize record that does not exist. See it retireved from the server.
  //update record using set. commands. see revisions. commit. see changes.
  //update record using set. commands. discard. see no changes.
  
  //destroy record. see it be gone? then commit. see it passed to server.
  //destroy record. then discard. see it still be there. should be reverted.
  //create new record. set params. save to server using commit. see new guid come in.
//  create chained store. chained store is in the parentStore's array. chainedStore has parentStore set.
//create new record as child of chainedStore. See that it does not exist in parentStore. commit. See it in parent store. See it passed to server.

  get record and update it. see that parentStore and chainedStore have different instances of dataHash. commit it. check if they are the same chained to parent.
  get record and update it. see that parentStore and chainedStore have different instances of dataHash. discard it. check if they are the same. parent to chained.
  get record in parentStore and cainedStore. update chainedStore record.. see that parentStore and chainedStore have different instances of dataHash AND record.  commit it. check if they are the same chained to parent.
  get record in parentStore and cainedStore. update chainedStore record.. see that parentStore and chainedStore have different instances of dataHash AND record.  discard it. ccheck if they are the same. parent to chained.
 
 // create new record as child of chainedStore. See that it does not exist in parentStore. discard. See it NOT parent store or chained store. See it NOT passed to the server.
  
  
  create new record in parentStore. commit. See it in childStore.
  create new record in parentStore. discard. see it NOT in childStore.
  
  create new chainedStore in chainedStore.
  create new record in child chainedStore. commit. See it in chainedStore but not in parentStore. commit chainedStore. See it in parent. commit parentStore, see in server.
  create new record in child chainedStore. discard. See it not chainedStore but not in parentStore. 
  
  
  
  




*/


/* Now, materialize records, make sure that they are the correct type. */
/* get one record, edit record it, commit. */
/* get 10 records, edit record them, commit. */


