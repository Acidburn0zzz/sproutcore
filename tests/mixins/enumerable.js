// ========================================================================
// SC.Enumerable Tests
// ========================================================================

// Define some standard tests.  We need to test both on a custom enumerable
// and on a real Array.
var EnumerableTests = {
  
  "should get enumerator that iterates through objects": function() {
    var e = src.enumerator() ;
    assertNotEqual(e, null, 'enumerator must not be null');
    
    var idx = 0;
    var cur ;
    while(cur = e.nextObject()) {
      assertEqual(src.objectAt(idx), cur, "object at index %@".fmt(idx)) ;
      idx++;
    }
    
    assertEqual(src.get('length'), idx) ;
  },
  
  "should run forEach() to go through objects": function() {
    var idx = 0;
    
    // save for testing later
    var items = [] ;
    var indexes = [] ;
    var arrays = [] ;
    var targets = [] ;
    
    src.forEach(function(item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);
    }, this);
    
    var len = src.get('length') ;
    for(var idx=0;idx<len;idx++) {
      assertEqual(items[idx], src.objectAt(idx)) ;
      assertEqual(indexes[idx], idx) ;
      assertEqual(arrays[idx], src) ;
      assertEqual(targets[idx], this) ;
    }
  },
  
  "should map to values while passing proper params": function() {
    var idx = 0;
    
    // save for testing later
    var items = [] ;
    var indexes = [] ;
    var arrays = [] ;
    var targets = [] ;
    
    var mapped = src.map(function(item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);
      
      return index ;
    }, this);
    
    var len = src.get('length') ;
    for(var idx=0;idx<len;idx++) {
      assertEqual(src.objectAt(idx), items[idx], "items") ;
      assertEqual(idx, indexes[idx], "indexes") ;
      assertEqual(src, arrays[idx], 'arrays') ;
      assertEqual(SC.guidFor(this), SC.guidFor(targets[idx]), "this") ;
      
      assertEqual(idx, mapped[idx], "mapped") ;
    }
  },
  
  "should filter to items that return for callback": function() {
    var idx = 0;
    
    // save for testing later
    var items = [] ;
    var indexes = [] ;
    var arrays = [] ;
    var targets = [] ;
    
    var filtered = src.filter(function(item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);
  
      return item.gender === "female" ;
    }, this);
    
    var len = src.get('length') ;
    for(var idx=0;idx<len;idx++) {
      assertEqual(src.objectAt(idx), items[idx], "items") ;
      assertEqual(idx, indexes[idx], "indexes") ;
      assertEqual(src, arrays[idx], 'arrays') ;
      assertEqual(SC.guidFor(this), SC.guidFor(targets[idx]), "this") ;
    }
    
    filtered.length.shouldEqual(1) ;
    filtered[0].first.shouldEqual("Jenna") ;
  },
  
  "should return true if function for every() returns true": function() {
    var idx = 0;
    
    // save for testing later
    var items = [] ;
    var indexes = [] ;
    var arrays = [] ;
    var targets = [] ;
    
    var result = src.every(function(item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);
  
      return true ;
    }, this);
    
    var len = src.get('length') ;
    for(var idx=0;idx<len;idx++) {
      assertEqual(src.objectAt(idx), items[idx], "items") ;
      assertEqual(idx, indexes[idx], "indexes") ;
      assertEqual(src, arrays[idx], 'arrays') ;
      assertEqual(SC.guidFor(this), SC.guidFor(targets[idx]), "this") ;
    }
  
    assertEqual(result, YES) ;
  },
  
  "should return false if one function for every() returns false": function() {
    var result = src.every(function(item, index, array) {
      return item.gender === "male" ;
    }, this);
    assertEqual(result, NO) ;
  },
  
  "should return false if all functions for some() returns false": function() {
    var idx = 0;
    
    // save for testing later
    var items = [] ;
    var indexes = [] ;
    var arrays = [] ;
    var targets = [] ;
    
    var result = src.some(function(item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);
  
      return false ;
    }, this);
    
    var len = src.get('length') ;
    for(var idx=0;idx<len;idx++) {
      assertEqual(src.objectAt(idx), items[idx], "items") ;
      assertEqual(idx, indexes[idx], "indexes") ;
      assertEqual(src, arrays[idx], 'arrays') ;
      assertEqual(SC.guidFor(this), SC.guidFor(targets[idx]), "this") ;
    }
  
    assertEqual(result, NO) ;
  },
  
  "should return true if one function for some() returns true": function() {
    var result = src.some(function(item, index, array) {
      return item.gender !== "male" ;
    }, this);
    assertEqual(result, YES) ;
  },
  
    
  "should mapProperty for all items": function() {
    var mapped = src.mapProperty("first") ;
    var idx ;
    var len = src.get('length') ;
    for(idx=0;idx<len;idx++) {
      mapped[idx].shouldEqual(src.objectAt(idx).first) ;
    }
  },
  
  "should filterProperty with match": function() {
    var filtered = src.filterProperty("gender", "female") ;
    filtered.length.shouldEqual(1) ;
    filtered[0].first.shouldEqual("Jenna") ;
  },
  
  "should filterProperty with default bool": function() {
    var filtered = src.filterProperty("californian") ;
    filtered.length.shouldEqual(1) ;
    filtered[0].first.shouldEqual("Jenna") ;
  },
  
  
  
  "everyProperty should return true if all properties macth": function() {
    var ret = src.everyProperty('visited', 'Prague') ;
    assertEqual(YES, ret, "visited") ;
  },
  
  "everyProperty should return true if all properties true": function() {
    var ret = src.everyProperty('ready') ;
    assertEqual(YES, ret, "ready") ;
  },
  
  "everyProperty should return false if any properties false": function() {
    var ret = src.everyProperty('gender', 'male') ;
    assertEqual(NO, ret, "ready") ;
  },
  
  
  "someProperty should return false if all properties not match": function() {
    var ret = src.someProperty('visited', 'Timbuktu') ;
    assertEqual(NO, ret, "visited") ;
  },
  
  "someProperty should return false if all properties false": function() {
    var ret = src.someProperty('doneTravelling') ;
    assertEqual(NO, ret, "doneTravelling") ;
  },
  
  "someProperty should return true if any properties true": function() {
    var ret = src.someProperty('first', 'Charles') ;
    assertEqual(YES, ret, "first") ;
  },
  
  "invokeWhile should call method on member objects until return does not match": function() {
    var ret = src.invokeWhile("OK", "invokeWhileTest", "item2") ;
    assertEqual("FAIL", ret, "return value");
  },
  
  "get @min(balance) should return the minimum balance": function() {
    assertEqual(1, src.get('@min(balance)')) ;
  },
  
  "get @max(balance) should return the maximum balance": function() {
    assertEqual(4, src.get('@max(balance)')) ;
  },
  
  "get @minObject(balance) should return the record with min balance": function() {
    assertEqual(src.objectAt(0), src.get('@minObject(balance)')) ;
  },
  
  "get @maxObject(balance) should return the record with the max balance": function() {
    assertEqual(src.objectAt(0), src.get('@maxObject(balance)')) ;
  },
  
  "get @sum(balance) should return the sum of the balances.": function() {
    assertEqual(1+2+3+4, src.get("@sum(balance)")) ;
  },
  
  "get @average(balance) should return the average of balances": function() {
    assertEqual((1+2+3+4)/4, src.get("@average(balance)")) ;
  },
  
  "should invoke custom reducer": function() {
    // install reducer method
    src.reduceTest = reduceTestFunc ;
    assertEqual("TEST", src.get("@test")) ;
    assertEqual("prop", src.get("@test(prop)")) ;
  },
  
  "should trigger observer of reduced prop when array changes once property retrieved once": function() {
  
    // get the property...this will install the reducer property...
    src.get("@max(balance)") ;
    
    // install observer
    var observedValue = null ;
    src.addObserver("@max(balance)", function() { 
      observedValue = src.get("@max(balance)");
    }) ;
    
    src.addProbe('[]') ;
    src.addProbe('@max(balance)');
    
    // add record to array
    src.pushObject({ 
      first: "John", 
      gender: "male", 
      californian: NO, 
      ready: YES, 
      visited: "Paris", 
      balance: 5
    }) ;
    
    //SC.NotificationQueue.flush() ; // force observers to trigger
    
    // observed value should now be set because the reduced property observer
    // was triggered when we changed the array contents.
    assertEqual(5, observedValue, "observedValue") ;
  },
  
  "should trigger observer of reduced prop when array changes - even if you never retrieved the property before": function() {
    // install observer
    var observedValue = null ;
    src.addObserver("@max(balance)", function() { 
      observedValue = src.get("@max(balance)");
    }) ;
    
    // add record to array
    src.pushObject({ 
      first: "John", 
      gender: "male", 
      californian: NO, 
      ready: YES, 
      visited: "Paris", 
      balance: 5
    }) ;
    
    //SC.NotificationQueue.flush() ; // force observers to trigger
    
    // observed value should now be set because the reduced property observer
    // was triggered when we changed the array contents.
    assertEqual(5, observedValue, "observedValue") ;
  }
  
}; 

var DummyEnumerable = SC.Object.extend(SC.Enumerable, {
  
  content: [],
  
  length: function() { return this.content.length; }.property(),
  
  objectAt: function(idx) { return this.content[idx]; },
  
  nextObject: function(idx) { return this.content[idx]; },
  
  // add support for reduced properties.
  unknownProperty: function(key, value) {
    var ret = this.reducedProperty(key, value) ;
    if (ret === undefined) {
      if (value !== undefined) this[key] = value ;
      ret = value ;
    }
    return ret ;
  },
  
  pushObject: function(object) {
    this.content.push(object) ;
    this.enumerableContentDidChange() ;
  }
  
}) ;

var runFunc = function(a,b) { return ['DONE', a, b]; } ;
var invokeWhileOK = function() { return "OK"; } ;
var invokeWhileNotOK = function() { return "FAIL"; };
var reduceTestFunc = function(prev, item, idx, e, pname) { return pname||'TEST'; } ;

var CommonArray = [
  { first: "Charles", 
    gender: "male", 
    californian: NO, 
    ready: YES, 
    visited: "Prague", 
    doneTravelling: NO, 
    run: runFunc,
    invokeWhileTest: invokeWhileOK,
    balance: 1
  },

  { first: "Jenna", 
    gender: "female", 
    californian: YES, 
    ready: YES, 
    visited: "Prague", 
    doneTravelling: NO, 
    run: runFunc,
    invokeWhileTest: invokeWhileOK,
    balance: 2 
  },
  
  { first: "Peter", 
    gender: "male", 
    californian: NO, 
    ready: YES, 
    visited: "Prague", 
    doneTravelling: NO, 
    run: runFunc,
    invokeWhileTest: invokeWhileNotOK,
    balance: 3 
  },
  
  { first: "Chris", 
    gender: "male", 
    californian: NO, 
    ready: YES, 
    visited: "Prague", 
    doneTravelling: NO, 
    run: runFunc,
    invokeWhileTest: invokeWhileOK,
    balance: 4
  } ] ;

Test.context("Real Array", SC.mixin({
  
  setup: function() { 
    src = CommonArray.clone(); 
  },
  
  teardown: function() { 
    delete src ; 
    
    delete Array.prototype["@max(balance)"] ; // remove cached value
    delete Array.prototype["@min(balance)"] ;
  },

  /*
    This is a particular problem because reduced properties are registered
    as dependent keys, which are not automatically configured in native 
    Arrays (where the SC.Object.init method is not run).  
  
    The fix for this problem was to add an initObservable() method to 
    SC.Observable that will configure bindings and dependent keys.  This
    method is called from SC.Object.init() and it is called in
    SC.Observable._notifyPropertyChanges if it has not been called already.
  
    SC.Enumerable was in turn modified to register reducers as dependent 
    keys so that now they will be registered on the Array before any 
    property change notifications are sent.
  */
  "should notify observers even if reduced property is cached on prototype": function() {
    
    // make sure reduced property is cached
    src.get("@max(balance)") ;
    
    // now make a clone and observe
    src = CommonArray.clone() ;
    
    // get the property...this will install the reducer property...
    src.get("@max(balance)") ;
    
    // install observer
    var observedValue = null ;
    src.addObserver("@max(balance)", function() { 
      observedValue = src.get("@max(balance)");
    }) ;
    
    src.addProbe('[]') ;
    src.addProbe('@max(balance)');
    
    // add record to array
    src.pushObject({ 
      first: "John", 
      gender: "male", 
      californian: NO, 
      ready: YES, 
      visited: "Paris", 
      balance: 5
    }) ;
    
    //SC.NotificationQueue.flush() ; // force observers to trigger
    
    // observed value should now be set because the reduced property observer
    // was triggered when we changed the array contents.
    assertEqual(5, observedValue, "observedValue") ;
  }

}, EnumerableTests));

Test.context("DummyEnumerable", SC.mixin({
  
  setup: function() { 
    src = DummyEnumerable.create({ content: CommonArray }) ;
  },
  
  teardown: function() { delete src ; }

}, EnumerableTests));
