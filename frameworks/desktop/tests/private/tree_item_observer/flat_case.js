// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// The TreeItemObserver is tested based on the common use cases.

var content, flattened, delegate, obs, length;

// default delegate class.  Does the bare minimum for tree item to function
var Delegate = SC.Object.extend(SC.TreeItemDelegate, {
  
  content: null, // must contain content array
  
  treeItemChildren: function(item, parent, index) {
    if (item) return item.get ? item.get('children') : item.children;
    else return parent ? null : this.get('content');
  },

  treeItemDisclosureState: function(item, parent, idx) {
    if (item && this.treeItemChildren(item,parent,idx)) {
      return item.get('isExpanded') ? SC.BRANCH_OPEN : SC.BRANCH_CLOSED;
    } else return SC.LEAF_NODE;
  }
});

module("SC._TreeItemObserver - Flat Array Use Case", {
  setup: function() {
    content = "1 2 3 4 5".w().map(function(x) { 
      return SC.Object.create({ title: x });
    });
    
    flattened = content.slice();
    
    delegate = Delegate.create({ content: content });

    obs = SC._TreeItemObserver.create({
      delegate: delegate, children: content
    });
  },
  
  teardown: function() {
    if (obs) obs.destroy(); // cleanup
    content = delegate = obs = null ;
  }
});

// ..........................................................
// LENGTH
// 

test("length on create", function() {
  equals(obs.get('length'), 5, 'should have length of array on create');
});


// ..........................................................
// OBJECT AT
// 

function verifyObjectAt(obs, expected, desc) {
  var idx, len = expected.get('length'), actual;

  equals(obs.get('length'), len, "%@ - length should match".fmt(desc));
  for(idx=0;idx<len;idx++) {
    actual = obs.objectAt(idx);
    equals(actual, expected[idx], "%@ - observer.objectAt(%@) should match expected".fmt(desc, idx));
  }
}

test("objectAt on create", function() {
  verifyObjectAt(obs, flattened, "on create");
});
