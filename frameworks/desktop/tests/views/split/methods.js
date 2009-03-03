// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */
var pane, view, thumb ;
module("SC.SplitView",{
	setup: function() {
	    SC.RunLoop.begin();
	    pane = SC.MainPane.create({
		  childViews: [
		    SC.SplitView.extend({
			  layout: { hieght: 300, width: 200 },
			  layoutDirection: SC.LAYOUT_HORIZONTAL,
<<<<<<< HEAD:frameworks/desktop/tests/views/split/methods.js
			  topLeftView: SC.ThumbView
//			  childViews: [ SC.ThumbView.create() ]
=======
			  childViews: [ SC.ThumbView.extend() ]
>>>>>>> Files for check-in 03 March 2009:frameworks/desktop/tests/views/split/methods.js
		    })]
		});
		pane.append(); // make sure there is a layer...
	    SC.RunLoop.end();
	
		view = pane.childViews[0];
<<<<<<< HEAD:frameworks/desktop/tests/views/split/methods.js
		thumb = view.childViews[0];
=======
		thumb = view.childViews[1];
>>>>>>> Files for check-in 03 March 2009:frameworks/desktop/tests/views/split/methods.js
	},
    	
	teardown: function() {
    	pane.remove();
    	pane = view = null ;
  	}		
});

test("the views are collapsible", function() {
	equals(YES,view.canCollapseView(view.get('topLeftView')),'the top left view is collapsable');
	equals(YES,view.canCollapseView(view.get('bottomRightView')),'the bottom right view is collapsable');	
	equals(YES,view.splitViewCanCollapse(view,view.get('topLeftView')),'should return true');
	view.set('canCollapseViews','NO');
});

test("the thickness of the views",function(){
	ok(view.thicknessForView(view.get('topLeftView')),'thickness of the topLeftView');
	ok(view.thicknessForView(view.get('bottomRightView')),'thickness of the bottomRightView');
});


test("updateChildLayout method updates the layout display",function(){
	ok(view.$().hasClass('horizontal'), 'should no longer have horizontal class');
	var q = Q$('span', view.get('layer'));
//	q.createChildViews();
// 	view.get('topLeftView').top = 25;
// 	view.updateChildLayout();
// 	alert(view.thicknessForView(view.get('topLeftView')));
// 	SC.RESIZE_BOTH is currently unsupported.	
});

test("performing the mouse up event", function() {
<<<<<<< HEAD:frameworks/desktop/tests/views/split/methods.js
	var elem = thumb.get('layer'); alert(thumb);
	SC.Event.trigger(elem, 'mouseUp');
=======
	var elem = view.get('layer');
	SC.Event.trigger(elem, 'mouseUp'); alert(view);
>>>>>>> Files for check-in 03 March 2009:frameworks/desktop/tests/views/split/methods.js
});

// 	
// module("TODO: Test SC.SplitDividerView Methods");
// module("TODO: Test SC.ThumbView Methods");
