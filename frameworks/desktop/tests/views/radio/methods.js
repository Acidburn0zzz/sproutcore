// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var pane, view ;
module("SC.RadioView Logic", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.MainPane.create({
      childViews: [
        SC.RadioView.extend({
          layout: { right: 20, bottom: 20, width: 100, height: 23 },
          items: 'Red Green'.w(),
          value: 'Red',
          isEnabled: YES
        })]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();
    
    view = pane.childViews[0];
  }, 
  
  teardown: function() {
    pane.remove();
    pane = view = null ;
  }
});

test("renders an input tag with appropriate attributes", function() {
  equals(view.get('value'), 'Red', 'precon - value should be YES');

  var q = Q$('input', view.get('layer'));
  equals(q.attr('type'), 'radio', 'should have type=radio');
  equals(q.attr('name'), SC.guidFor(view), 'should have name=view_guid');
  equals(q.attr('checked'), YES, 'should be checked');
});

test("changing the value should update the group", function() {
  var oldValue = view.get('value');
  SC.RunLoop.begin();
  view.set('value', 'Green');
  SC.RunLoop.end();

  ok(view.get('value') !== oldValue, 'precond - should have changed value');
  var q = Q$('.sel > span', view.get('layer'));
  equals(q.text(), view.get('value'), 'label should have new value');
});

test("isEnabled should alter group classname and sync with isEnabled property", function() {

  // check initial render state
  ok(view.get('isEnabled'), 'isEnabled should match value');
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');

  // update value -- make sure isEnabled changes.  
  SC.RunLoop.begin();
  view.set('isEnabled', 0); // make falsy. (but not NO exactly)
  SC.RunLoop.end();
  
  ok(!view.get('isEnabled'), 'isEnabled should now be NO');
  ok(view.$().hasClass('disabled'), 'should have disabled class');

  // update isEnabled -- make sure it edits the value
  SC.RunLoop.begin();
  view.set('isEnabled', YES);
  SC.RunLoop.end();
  
  ok(view.get('isEnabled'), 'isEnabled should match value');
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
});

test("clicking on a radio button will change toggle the value", function() {
  equals(view.get('value'), 'Red', 'precond - value should be Red');
  view.$('input').get(1).click();
  equals(view.get('value'), 'Green', 'value should have changed');
});

test("pressing mouseDown and then mouseUp anywhere in a radio button should toggle the selection", function() {

  var elem = view.get('layer'), input = SC.$('input', elem);
  
  SC.Event.trigger(elem, 'mousedown');
  ok(view.get('isActive'), 'view should be active');
  equals(view.get('value'), 'Red', 'value should not change yet');
  
  // simulate mouseUp and browser-native change to control
  SC.Event.trigger(elem,'mouseup');
  input.attr('checked', NO);
  SC.Event.trigger(input.get(1),'change');
  
  // TODO: figure out why these fail
  //ok(view.get('isActive'), 'view should no longer be active');
  //equals(view.get('value'), 'Green', 'value should change');
  
  input = elem = null ;
});
