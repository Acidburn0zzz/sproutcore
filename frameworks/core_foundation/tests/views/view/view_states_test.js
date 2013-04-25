// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals ok */

var parent;

/** Test the SC.View states. */
module("SC.View States", {

  setup: function () {
    parent = SC.View.create();
  },

  teardown: function () {
    parent.destroy();
    parent = null;
  }

});

/**
  Test the state, in particular supported actions.
  */
test("Test unrendered state.", function () {
  var handled,
    view = SC.View.create();

  // Test expected state of the view.
  equals(view._state, 'unrendered', "A newly created view should be in the state");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('isRendered'), "isRendered should be false");
  ok(!view.get('isHidden'), "isHidden should be false");
  ok(!view.get('isShown'), "isShown should be false");

  // _doAttach(document.body)
  // _doDestroyLayer()
  // _doDetach()
  // _doHide()
  // _doRender()
  // _doShow()
  // _doUpdateContent()
  // _doUpdateLayout()

  // UNHANDLED ACTIONS
  handled = view._doAttach(document.body);
  ok(!handled, "Calling _doAttach(document.body) should not be handled");
  equals(view._state, 'unrendered', "Calling _doAttach(document.body) doesn't change state");

  handled = view._doDestroyLayer();
  ok(!handled, "Calling _doDestroyLayer() should not be handled");
  equals(view._state, 'unrendered', "Calling _doDestroyLayer() doesn't change state");

  handled = view._doDetach();
  ok(!handled, "Calling _doDetach() should not be handled");
  equals(view._state, 'unrendered', "Calling _doDetach() doesn't change state");

  handled = view._doHide();
  ok(!handled, "Calling _doHide() should not be handled");
  equals(view._state, 'unrendered', "Calling _doHide() doesn't change state");

  handled = view._doShow();
  ok(!handled, "Calling _doShow() should not be handled");
  equals(view._state, 'unrendered', "Calling _doShow() doesn't change state");

  handled = view._doUpdateContent();
  ok(!handled, "Calling _doUpdateContent() should not be handled");
  equals(view._state, 'unrendered', "Calling _doUpdateContent() doesn't change state");

  handled = view._doUpdateLayout();
  ok(!handled, "Calling _doUpdateLayout() should not be handled");
  equals(view._state, 'unrendered', "Calling _doUpdateLayout() doesn't change state");


  // HANDLED ACTIONS
  handled = view._doRender();
  ok(handled, "Calling _doRender() should be handled");
  equals(view._state, 'unattached', "Calling _doRender() changes state");


  // CLEAN UP
  view.destroy();
});

/**
  Test the state, in particular supported actions.
  */
test("Test unattached state.", function () {
  var handled,
    view = SC.View.create();

  // Test expected state of the view.
  view._doRender();
  equals(view._state, 'unattached', "A newly created view that is rendered should be in the state");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(view.get('isRendered'), "isRendered should be true");
  ok(!view.get('isHidden'), "isHidden should be false");
  ok(!view.get('isShown'), "isShown should be false");

  // _doAttach(document.body)
  // _doDestroyLayer()
  // _doDetach()
  // _doHide()
  // _doRender()
  // _doShow()
  // _doUpdateContent()
  // _doUpdateLayout()

  // UNHANDLED ACTIONS
  handled = view._doDetach();
  ok(!handled, "Calling _doDetach() should not be handled");
  equals(view._state, 'unattached', "Calling _doDetach() doesn't change state");

  handled = view._doHide();
  ok(!handled, "Calling _doHide() should not be handled");
  equals(view._state, 'unattached', "Calling _doHide() doesn't change state");

  handled = view._doShow();
  ok(!handled, "Calling _doShow() should not be handled");
  equals(view._state, 'unattached', "Calling _doShow() doesn't change state");

  handled = view._doRender();
  ok(!handled, "Calling _doRender() should not be handled");
  equals(view._state, 'unattached', "Calling _doRender() doesn't change state");


  // HANDLED ACTIONS
  handled = view._doAttach(document.body);
  ok(handled, "Calling _doAttach(document.body) should be handled");
  equals(view._state, 'attached_shown', "Calling _doAttach(document.body) changes state");

  // Reset
  view.destroy();
  view = SC.View.create();
  view._doRender();

  handled = view._doDestroyLayer();
  ok(handled, "Calling _doDestroyLayer() should be handled");
  equals(view._state, 'unrendered', "Calling _doDestroyLayer() changes state");

  // Reset
  view.destroy();
  view = SC.View.create();
  view._doRender();

  handled = view._doUpdateContent();
  ok(handled, "Calling _doUpdateContent() should be handled");
  equals(view._state, 'unattached', "Calling _doUpdateContent() doesn't change state");

  handled = view._doUpdateLayout();
  ok(handled, "Calling _doUpdateLayout() should be handled");
  equals(view._state, 'unattached', "Calling _doUpdateLayout() doesn't change state");

  // Reset
  view.destroy();
  view = SC.View.create();
  view._doRender();

  handled = view._doAttach(document.body);
  ok(handled, "Calling _doAttach(document.body) with unrendered orphan parent should be handled");
  equals(view._state, 'attached_shown', "Calling _doAttach(document.body) changes state");


  // CLEAN UP
  view.destroy();
});

/**
  Test the state, in particular supported actions.
  */
test("Test attached_shown state.", function () {
  var handled,
    view = SC.View.create();

  // Test expected state of the view.
  view._doRender();
  view._doAttach(document.body);
  equals(view._state, 'attached_shown', "A newly created orphan view that is rendered and attached should be in the state");
  ok(view.get('isAttached'), "isAttached should be true");
  ok(view.get('isRendered'), "isRendered should be true");
  ok(!view.get('isHidden'), "isHidden should be false");
  ok(view.get('isShown'), "isShown should be true");

  // _doAttach(document.body)
  // _doDestroyLayer()
  // _doDetach()
  // _doHide()
  // _doRender()
  // _doShow()
  // _doUpdateContent()
  // _doUpdateLayout()


  // UNHANDLED ACTIONS
  handled = view._doAttach(document.body);
  ok(!handled, "Calling _doAttach(document.body) should not be handled");
  equals(view._state, 'attached_shown', "Calling _doAttach(document.body) doesn't change state");

  handled = view._doDestroyLayer();
  ok(!handled, "Calling _doDestroyLayer() should not be handled");
  equals(view._state, 'attached_shown', "Calling _doDestroyLayer() doesn't change state");

  handled = view._doRender();
  ok(!handled, "Calling _doRender() should not be handled");
  equals(view._state, 'attached_shown', "Calling _doRender() doesn't change state");

  handled = view._doShow();
  ok(!handled, "Calling _doShow() should not be handled");
  equals(view._state, 'attached_shown', "Calling _doShow() doesn't change state");


  // HANDLED ACTIONS
  handled = view._doUpdateContent();
  ok(handled, "Calling _doUpdateContent() should be handled");
  equals(view._state, 'attached_shown', "Calling _doUpdateContent() doesn't change state");

  handled = view._doUpdateLayout();
  ok(handled, "Calling _doUpdateLayout() should be handled");
  equals(view._state, 'attached_shown', "Calling _doUpdateLayout() doesn't change state");

  handled = view._doDetach();
  ok(handled, "Calling _doDetach() should be handled");
  equals(view._state, 'unattached', "Calling _doDetach() changes state");

  // Reset
  view.destroy();
  view = SC.View.create();
  view._doRender();
  view._doAttach(document.body);

  handled = view._doHide();
  ok(handled, "Calling _doHide() should be handled");
  equals(view._state, 'attached_hidden', "Calling _doHide() changes state");


  // CLEAN UP
  view.destroy();
});


/** Test the SC.View state propagation to child views. */
module("SC.View Adoption", {

  setup: function () {
    parent = SC.View.create();
  },

  teardown: function () {
    parent.destroy();
    parent = null;
  }

});


test("Test adding a child brings that child to the same state as the parent.", function () {
  var child = SC.View.create(),
    view = SC.View.create({ childViews: [child] });

  // Test expected state of the view.
  view._doAdopt(parent);
  equals(parent._state, 'unrendered', "A newly created parent should be in the state");
  equals(view._state, 'unrendered', "A newly created child view of unrendered parent should be in the state");
  equals(child._state, 'unrendered', "A newly created child view of unrendered parent's child view should be in the state");
  ok(!view.get('isRendered'), "isRendered should be false");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('isHidden'), "isHidden should be false");
  ok(!view.get('isShown'), "isShown should be false");

  // Render the view.
  view._doRender();
  equals(view._state, 'unattached', "A rendered child view of unrendered parent should be in the state");
  equals(child._state, 'unattached', "A rendered child view of unrendered parent's child view should be in the state");
  ok(view.get('isRendered'), "isRendered should be true");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('isHidden'), "isHidden should be false");
  ok(!view.get('isShown'), "isShown should be false");

  // Attach the view.
  view._doAttach(document.body);
  equals(view._state, 'attached_hidden', "An attached child view of unrendered parent should be in the state");
  equals(child._state, 'attached_hidden', "An attached child view of unrendered parent's child view should be in the state");
  ok(view.get('isRendered'), "isRendered should be true");
  ok(view.get('isAttached'), "isAttached should be true");
  ok(view.get('isHidden'), "isHidden should be true");
  ok(!view.get('isShown'), "isShown should be false");

  // Reset
  view.destroy();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });

  parent._doRender();
  view._doAdopt(parent);
  equals(parent._state, 'unattached', "A newly created parent that is rendered should be in the state");
  equals(view._state, 'unattached', "A newly created child view of unattached parent should be in the state");
  equals(child._state, 'unattached', "A newly created child view of unattached parent's child view should be in the state");
  ok(view.get('isRendered'), "isRendered should be true");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('isHidden'), "isHidden should be false");
  ok(!view.get('isShown'), "isShown should be false");

  // Attach the view.
  view._doAttach(document.body);
  equals(view._state, 'attached_hidden', "An attached child view of unattached parent should be in the state");
  equals(child._state, 'attached_hidden', "An attached child view of unattached parent's child view should be in the state");
  ok(view.get('isRendered'), "isRendered should be true");
  ok(view.get('isAttached'), "isAttached should be true");
  ok(view.get('isHidden'), "isHidden should be true");
  ok(!view.get('isShown'), "isShown should be false");

  // Reset
  view.destroy();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });

  parent._doAttach(document.body);
  view._doAdopt(parent);
  equals(parent._state, 'attached_shown', "A newly created parent that is attached should be in the state");
  equals(view._state, 'attached_shown', "A newly created child view of unattached parent should be in the state");
  equals(child._state, 'attached_shown', "A newly created child view of unattached parent's child view should be in the state");
  ok(view.get('isRendered'), "isRendered should be true");
  ok(view.get('isAttached'), "isAttached should be true");
  ok(!view.get('isHidden'), "isHidden should be false");
  ok(view.get('isShown'), "isShown should be true");


  // CLEAN UP
  view.destroy();
});


test("Test showing and hiding parent updates child views.", function () {
  var handled,
    child = SC.View.create(),
    view = SC.View.create({ childViews: [child] });

  // Test expected state of the view.
  parent._doRender();
  parent._doAttach(document.body);
  view._doAdopt(parent);
  equals(parent._state, 'attached_shown', "A newly created parent that is attached should be in the state");
  equals(view._state, 'attached_shown', "A newly created child view of unattached parent should be in the state");
  equals(child._state, 'attached_shown', "A newly created child view of unattached parent's child view should be in the state");
  ok(!view.get('isHidden'), "isHidden should be false");
  ok(view.get('isShown'), "isShown should be true");
  ok(!view.get('isHiddenBySelf'), "isHiddenBySelf should be false");
  ok(!view.get('isHiddenByAncestor'), "isHiddenByAncestor should be false");

  // Hide the parent.
  parent._doHide();
  equals(parent._state, 'attached_hidden', "A hidden parent that is attached should be in the state");
  equals(view._state, 'attached_hidden', "A child view of attached_hidden parent should be in the state");
  equals(child._state, 'attached_hidden', "A child view of attached_hidden parent's child view should be in the state");
  ok(parent.get('isHiddenBySelf'), "isHiddenBySelf of child should be true");
  ok(!parent.get('isHiddenByAncestor'), "isHiddenByAncestor of child should be false");
  ok(view.get('isHidden'), "isHidden should be true");
  ok(!view.get('isShown'), "isShown should be false");
  ok(!view.get('isHiddenBySelf'), "isHiddenBySelf should be false now");
  ok(view.get('isHiddenByAncestor'), "isHiddenByAncestor should be true now");

  // Show the view.
  handled = view._doShow();
  ok(!handled, "Calling _doShow() should not be handled.");
  equals(view._state, 'attached_hidden', "Calling _doShow() doesn't change state");
  ok(!view.get('isHiddenBySelf'), "isHiddenBySelf should be false");
  ok(view.get('isHiddenByAncestor'), "isHiddenByAncestor should be true still");

  // Show the parent/hide the view.
  handled = parent._doShow();
  ok(handled, "Calling _doShow() should be handled");
  equals(view._state, 'attached_shown', "Calling _doShow() changes state");
  equals(child._state, 'attached_shown', "Calling _doShow() changes state");
  ok(!parent.get('isHiddenBySelf'), "isHiddenBySelf of child should be false");
  ok(!parent.get('isHiddenByAncestor'), "isHiddenByAncestor of child should be false");
  ok(!view.get('isHiddenBySelf'), "isHiddenBySelf should be false");
  ok(!view.get('isHiddenByAncestor'), "isHiddenByAncestor should be false");
  handled = view._doHide();
  ok(handled, "Calling _doHide() should be handled");
  equals(view._state, 'attached_hidden', "Calling _doHide() changes state");
  equals(child._state, 'attached_hidden', "Calling _doHide() changes state");
  ok(view.get('isHiddenBySelf'), "isHiddenBySelf should be true");
  ok(!view.get('isHiddenByAncestor'), "isHiddenByAncestor should be false");

  // Reset
  parent._doHide();
  view.destroy();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });
  view._doAdopt(parent);

  // Add child to already hidden parent.
  equals(view._state, 'attached_hidden', "A child view of attached_hidden parent should be in the state");
  equals(child._state, 'attached_hidden', "A child view of attached_hidden parent's child view should be in the state");
  ok(view.get('isHidden'), "isHidden should be true");
  ok(!view.get('isShown'), "isShown should be false");
  ok(!view.get('isHiddenBySelf'), "isHiddenBySelf should be false on add");
  ok(view.get('isHiddenByAncestor'), "isHiddenByAncestor should be true on add");

  // Reset
  parent.destroy();
  parent = SC.View.create();
  parent._doRender();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });
  view._doAdopt(parent);

  // Attach a parent with children
  equals(view._state, 'unattached', "A child view of unattached parent should be in the state");
  equals(child._state, 'unattached', "A child view of unattached parent's child view should be in the state");
  parent._doAttach(document.body);
  equals(view._state, 'attached_shown', "A child view of attached_shown parent should be in the state");
  equals(child._state, 'attached_shown', "A child view of attached_shown parent's child view should be in the state");
  ok(!view.get('isHiddenBySelf'), "isHiddenBySelf should be false");
  ok(!view.get('isHiddenByAncestor'), "isHiddenByAncestor should be false");

  // CLEAN UP
  view.destroy();
});

test("Test isVisible integration with shown and hidden state.", function () {
  var child = SC.View.create(),
    view = SC.View.create({ childViews: [child] });

  // Test expected state of the view.
  parent._doRender();
  parent._doAttach(document.body);
  view._doAdopt(parent);

  // Hide the view using isVisible.
  SC.run(function () {
    view.set('isVisible', false);
  });
  equals(parent._state, 'attached_shown', "A parent that is attached should be in the state");
  equals(view._state, 'attached_hidden', "A child view of attached_shown parent with isVisible false should be in the state");
  equals(child._state, 'attached_hidden', "A child view of attached_shown parent with isVisible false's child view should be in the state");
  ok(view.get('isHidden'), "isHidden should be true");
  ok(!view.get('isShown'), "isShown should be false");
  ok(child.get('isHidden'), "isHidden of child should be true");
  ok(!child.get('isShown'), "isShown of child should be false");
  ok(view.get('isHiddenBySelf'), "isHiddenBySelf should be true");
  ok(!view.get('isHiddenByAncestor'), "isHiddenByAncestor should be false");
  ok(!child.get('isHiddenBySelf'), "isHiddenBySelf of child should be false");
  ok(child.get('isHiddenByAncestor'), "isHiddenByAncestor of child should be true");

  // Show the view using isVisible.
  SC.run(function () {
    view.set('isVisible', true);
  });
  equals(view._state, 'attached_shown', "A child view of attached_shown parent with isVisible true should be in the state");
  equals(child._state, 'attached_shown', "A child view of attached_shown parent with isVisible true's child view should be in the state");
  ok(!view.get('isHidden'), "isHidden should be false");
  ok(view.get('isShown'), "isShown should be true");
  ok(!child.get('isHidden'), "isHidden of child should be false");
  ok(child.get('isShown'), "isShown of child should be true");
  ok(!view.get('isHiddenBySelf'), "isHiddenBySelf should be false");
  ok(!view.get('isHiddenByAncestor'), "isHiddenByAncestor should be false");
  ok(!child.get('isHiddenBySelf'), "isHiddenBySelf of child should be false");
  ok(!child.get('isHiddenByAncestor'), "isHiddenByAncestor of child should be false");

  // Reset
  view.destroy();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });

  // Hide the parent using isVisible and then adopt child.
  SC.run(function () {
    parent.set('isVisible', false);
  });
  view._doAdopt(parent);
  equals(parent._state, 'attached_hidden', "A parent that is attached with isVisible false should be in the state");
  equals(view._state, 'attached_hidden', "A child view of attached with isVisible false parent should be in the state");
  equals(child._state, 'attached_hidden', "A child view of attached with isVisible false parent's child view should be in the state");
  ok(view.get('isHidden'), "isHidden should be true");
  ok(!view.get('isShown'), "isShown should be false");
  ok(child.get('isHidden'), "isHidden of child should be true");
  ok(!child.get('isShown'), "isShown of child should be false");
  ok(!view.get('isHiddenBySelf'), "isHiddenBySelf should be false");
  ok(view.get('isHiddenByAncestor'), "isHiddenByAncestor should be true");
  ok(!child.get('isHiddenBySelf'), "isHiddenBySelf of child should be false");
  ok(child.get('isHiddenByAncestor'), "isHiddenByAncestor of child should be true");

  // Hide the view and then show the parent using isVisible.
  SC.run(function () {
    view.set('isVisible', false);
    parent.set('isVisible', true);
  });
  equals(parent._state, 'attached_shown', "A parent that is attached with isVisible true should be in the state");
  equals(view._state, 'attached_hidden', "A child view of attached with isVisible true parent with isVisible false should be in the state");
  equals(child._state, 'attached_hidden', "A child view of attached with isVisible true parent with isVisible false's child view should be in the state");
  ok(view.get('isHidden'), "isHidden should be true");
  ok(!view.get('isShown'), "isShown should be false");
  ok(child.get('isHidden'), "isHidden of child should be true");
  ok(!child.get('isShown'), "isShown of child should be false");
  ok(view.get('isHiddenBySelf'), "isHiddenBySelf should be true");
  ok(!view.get('isHiddenByAncestor'), "isHiddenByAncestor should be false");
  ok(!child.get('isHiddenBySelf'), "isHiddenBySelf of child should be false");
  ok(child.get('isHiddenByAncestor'), "isHiddenByAncestor of child should be true");

  // Reset
  view.destroy();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });

  // Hide the view with isVisible and then add to parent.
  SC.run(function () {
    view.set('isVisible', false);
  });
  view._doAdopt(parent);
  equals(view._state, 'attached_hidden', "A child view added to attached with isVisible true parent with isVisible false should be in the state");
  equals(child._state, 'attached_hidden', "A child view added to attached with isVisible true parent with isVisible false's child view should be in the state");
  ok(view.get('isHidden'), "isHidden should be true");
  ok(!view.get('isShown'), "isShown should be false");
  ok(child.get('isHidden'), "isHidden of child should be true");
  ok(!child.get('isShown'), "isShown of child should be false");
  ok(view.get('isHiddenBySelf'), "isHiddenBySelf should be true");
  ok(!view.get('isHiddenByAncestor'), "isHiddenByAncestor should be false");
  ok(!child.get('isHiddenBySelf'), "isHiddenBySelf of child should be false");
  ok(child.get('isHiddenByAncestor'), "isHiddenByAncestor of child should be true");

  // CLEAN UP
  view.destroy();
});
