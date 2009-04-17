// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */
var set ;
module("SC.IndexSet#add", {
  setup: function() {
    set = SC.IndexSet.create();
  }
});

function iter(s) {
  var ret = [];
  set.forEach(function(k) { ret.push(k); });
  return ret ;
}

// ..........................................................
// BASIC ADDS
// 

test("add range to end of set", function() {
  set.add(1000,5);
  equals(set.get('length'), 5, 'should have correct index count');  
  equals(set.get('max'), 1005, 'max should return 1 past last index');
  same(iter(set), [1000,1001,1002,1003,1004]);
});

test("add range into middle of empty range", function() {
  set.add(100,2); // add initial set.
  equals(iter(set)[0], 100, 'precond - first index is 100');
  
  // now add second range
  set.add(10,1);
  equals(set.get('length'), 3, 'should have extra length');
  equals(set.get('max'), 102, 'max should return 1 past last index');
  same(iter(set), [10, 100, 101]);
});

test("add range overlapping front edge of range", function() {
  set.add(100,2); // add initial set.
  equals(iter(set)[0], 100, 'precond - first index is 100');
  
  // now add second range
  set.add(99,2);
  equals(set.get('length'), 3, 'should have extra length');
  equals(set.get('max'), 102, 'max should return 1 past last index');
  same(iter(set), [99, 100, 101]);
});

test("add range overlapping last edge of range", function() {
  set.add(100,2).add(200,2);
  same(iter(set), [100,101,200,201], 'should have two sets');
  
  // now add overlapping range
  set.add(101,2);
  equals(set.get('length'), 5, 'new set.length');
  equals(set.get('max'), 202, 'max should return 1 past last index');
  same(iter(set), [100,101,102,200,201], 'should include 101-102');
});

test("add range overlapping two ranges, merging into one", function() {
  set.add(100,2).add(110,2);
  same(iter(set), [100,101,110,111], 'should have two sets');
  
  // now add overlapping range
  set.add(101,10);
  equals(set.get('length'), 12, 'new set.length');
  equals(set.get('max'), 112, 'max should return 1 past last index');
  same(iter(set), [100,101,102,103,104,105,106,107,108,109,110,111], 'should include one range 100-111');
});

test("add range overlapping three ranges, merging into one", function() {
  set.add(100,2).add(105,2).add(110,2);
  same(iter(set), [100,101,105,106,110,111], 'should have two sets');
  
  // now add overlapping range
  set.add(101,10);
  equals(set.get('length'), 12, 'new set.length');
  equals(set.get('max'), 112, 'max should return 1 past last index');
  same(iter(set), [100,101,102,103,104,105,106,107,108,109,110,111], 'should include one range 100-111');
});

test("add range partially overlapping one range and replaing another range, merging into one", function() {
  set.add(100,2).add(105,2);
  same(iter(set), [100,101,105,106], 'should have two sets');
  
  // now add overlapping range
  set.add(101,10);
  equals(set.get('length'), 11, 'new set.length');

  equals(set.get('max'), 111, 'max should return 1 past last index');
  same(iter(set), [100,101,102,103,104,105,106,107,108,109,110], 'should include one range 100-110');
});

test("add range overlapping last index", function() {
  set.add(100,2); // add initial set.
  equals(iter(set)[0], 100, 'precond - first index is 100');
  
  // now add second range
  set.add(101,2);
  equals(set.get('length'), 3, 'should have extra length');
  equals(set.get('max'), 103, 'max should return 1 past last index');
  same(iter(set), [100, 101, 102]);
});

test("add range matching existing range", function() {
  set.add(100,5); // add initial set.
  equals(iter(set)[0], 100, 'precond - first index is 100');
  
  // now add second range
  set.add(100,5);
  equals(set.get('length'), 5, 'should not change');
  equals(set.get('max'), 105, 'max should return 1 past last index');
  same(iter(set), [100, 101, 102, 103, 104]);  
});


// ..........................................................
// OTHER BEHAVIORS
// 

test("adding a range should trigger an observer notification", function() {
  var callCnt = 0;
  set.addObserver('[]', function() { callCnt++; });
  set.add(10,10);
  equals(callCnt, 1, 'should have called observer once');
});

test("adding a range over an existing range should not trigger an observer notification", function() {
  var callCnt = 0;
  set.add(10,10);
  set.addObserver('[]', function() { callCnt++; });
  set.add(15,5);
  equals(callCnt, 0, 'should not have called observer');
});
