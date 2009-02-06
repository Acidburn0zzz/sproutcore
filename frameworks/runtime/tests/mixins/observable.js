// ========================================================================
// SC.Observable Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var object ; // global variables

module("object.get()", {
  
  setup: function() {
    object = SC.Object.create({
      
      normal: 'value',
      numberVal: 24,
      toggleVal: true,

      computed: function() { return 'value'; }.property(),
      
      method: function() { return "value"; },
      
      nullProperty: null,
      
      unknownProperty: function(key, value) {
        this.lastUnknownProperty = key ;
        return "unknown" ;
      }
      
    });
  }
  
});

test("should get normal properties", function() {
  equals(object.get('normal'), 'value') ;
});

test("should call computed properties and return their result", function() {
  equals(object.get("computed"), "value") ;
});

test("should return the function for a non-computed property", function() {
  var value = object.get("method") ;
  equals(SC.typeOf(value), SC.T_FUNCTION) ;
});

test("should return null when property value is null", function() {
  equals(object.get("nullProperty"), null) ;
});

test("should call unknownProperty when value is undefined", function() {
  equals(object.get("unknown"), "unknown") ;
  equals(object.lastUnknownProperty, "unknown") ;
});


module("object.set()", {
  
  setup: function() {
    object = SC.Object.create({
      
      // normal property
      normal: 'value',
      
      // computed property
      _computed: "computed",
      computed: function(key, value) {
        if (value !== undefined) {
          this._computed = value ;
        }
        return this._computed ;
      }.property(),
      
      // method, but not a property
      _method: "method",
      method: function(key, value) {
        if (value !== undefined) {
          this._method = value ;
        }
        return this._method ;
      },
      
      // null property
      nullProperty: null,
      
      // unknown property
      _unknown: 'unknown',
      unknownProperty: function(key, value) {
        if (value !== undefined) {
          this._unknown = value ;
        }
        return this._unknown ;
      }
      
    });
  }

});

test("should change normal properties and return this", function() {
  var ret = object.set("normal", "changed") ;
  equals(object.normal, "changed") ;
  equals(ret, object) ;
});

test("should call computed properties passing value and return this", function() {
  var ret = object.set("computed", "changed") ;
  equals(object._computed, "changed") ;
  equals(SC.typeOf(object.computed), SC.T_FUNCTION) ;
  equals(ret, object) ;
});

test("should replace the function for a non-computed property and return this", function() {
  var ret = object.set("method", "changed") ;
  equals(object._method, "method") ; // make sure this was NOT run
  ok(SC.typeOf(object.method) !== SC.T_FUNCTION) ;
  equals(ret, object) ;
});

test("should replace prover when property value is null", function() {
  var ret = object.set("nullProperty", "changed") ;
  equals(object.nullProperty, "changed") ;
  equals(object._unknown, "unknown"); // verify unknownProperty not called.
  equals(ret, object) ;
});

test("should call unknownProperty with value when property is undefined", function() {
  var ret = object.set("unknown", "changed") ;
  equals(object._unknown, "changed") ;
  equals(ret, object) ;
});


module("Observable objects & object properties ", {
  
  setup: function() {
    object = SC.Object.create({
      
      normal: 'value',
	  abnormal: 'zeroValue',
      numberVal: 24,
      toggleVal: true,
      observedProperty:'beingWatched',
	  testRemove:'observerToBeRemoved',	

      automaticallyNotifiesObserversFor: function(key) { 
	    return NO;
	  },
	  
	  getEach: function() {
	    	var keys = ['normal','abnormal'];
	    	var ret = [];
	    	for(var idx=0; idx<keys.length;idx++) {
	      		ret[ret.length] = this.getPath(keys[idx]);
	    	}
	    	return ret ;
	  },
	  
	  newObserver:function(){
			this.abnormal = 'changedValueObserved';
	  },
	
	  testObserver:function(){
			this.abnormal = 'removedObserver';
	  }
	
    });
  }
  
});

test('should increment and decrement the value of a property',function(){
  	var newValue = object.incrementProperty('numberVal');
    equals(25,newValue);
	object.numberVal = 24;
	newValue = object.decrementProperty('numberVal');
    equals(23,newValue);
});

test('should toggle with value of a property',function(){
  	equals(object.toggleProperty('toggleVal',true,false),object.get('toggleVal')); 
    equals(object.toggleProperty('toggleVal',true,false),object.get('toggleVal'));
    equals(object.toggleProperty('toggleVal',undefined,undefined),object.get('toggleVal'));
});

test('should not notify the observers automatically',function(){
  	equals(NO,object.automaticallyNotifiesObserversFor('normal')); 
});

test("should get all the values for the keys",function(){
     var valueArray = object.getEach();
     equals(valueArray[0],'value');
     equals(valueArray[1],'zeroValue');
});

test("should add an observer",function(){
	object.addObserver('observedProperty',object,object.newObserver());
	object.observedProperty = 'beingObserved';
	equals(object.abnormal,'changedValueObserved') ;
});

module("object.addObserver()", {	
	setup: function() {
				
		ObjectC = SC.Object.create({
			normal: 'value',
			normal1: 'zeroValue',
			normal2: 'dependentValue',
			incrementor: 10,
										
			action: function() {
				this.normal1= 'newZeroValue';
			},
			
			observeOnceAction: function() {
				this.incrementor= this.incrementor+1;
			}
		});
   	}
});

test("should register an observer for a property", function() {
	ObjectC.addObserver('normal', ObjectC, 'action');
	ObjectC.set('normal','newValue');
	equals(ObjectC.normal1, 'newZeroValue');
});

test("should register an observer for a property - Special case of reduced property", function() {
	
});

test("should register an observer for a property change for once or for the specified time interval", function() {
	// ObjectC.observeOnce('normal2', ObjectC,'observeOnceAction',15);
	// ObjectC.set('normal2','newValue');
	// equals(ObjectC.incrementor, 11);
	// ObjectC.set('normal2','AnotherNewValue');
	// equals(ObjectC.incrementor, 11);
});


module("object.removeObserver()", {	
	setup: function() {
		ObjectD = SC.Object.create({
			normal: 'value',
			normal1: 'zeroValue',
			normal2: 'dependentValue',
			ArrayKeys: ['normal','normal1'],
						
			addAction: function() {
				this.normal1= 'newZeroValue';
			},
			
			removeAction: function() {
				this.normal2= 'newDependentValue';
			}
		});
   	}
});

test("should unregister an observer for a property", function() {
	ObjectD.addObserver('normal', ObjectD, 'addAction');
	ObjectD.set('normal','newValue');
	equals(ObjectD.normal1, 'newZeroValue');
	
	ObjectD.set('normal1','zeroValue');
	
	ObjectD.removeObserver('normal', ObjectD, 'addAction');
	ObjectD.set('normal','newValue');
	equals(ObjectD.normal1, 'zeroValue');	
});


test("should unregister an observer for a property - special case when key has a '.' in it.", function() {
		
});



module("Bind function ", {
  
  setup: function() {
    objectA = SC.Object.create({
      name: "Sproutcore",
      location: "Timbaktu"
    });

   	objectB = SC.Object.create({
      normal: "value",
 	  computed:function(){
		this.normal = 'newValue';
	  }
    }) ;
         
    Namespace = {
      objectA: objectA,
	  objectB: objectB	
    } ;
  }
});

test("should bind property with method parameter as undefined", function() {
  // creating binding
  objectA.bind("name", "Namespace.objectB.normal",undefined) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  objectB.set("normal", "changedValue") ;
  
  // support new-style bindings if available
  SC.Binding.flushPendingChanges();
  equals("changedValue", objectA.get("name"), "objectA.name is binded");
});
