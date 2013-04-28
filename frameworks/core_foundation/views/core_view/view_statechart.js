sc_require("views/view");


SC.CoreView.reopen(
  /** @scope SC.CoreView.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /** @private
    Possible states:

    * unrendered
    * unattached
    * attached (wrapper state)
    ** attached_shown
    ** attached_hidden
    ** attached_building_in
    ** attached_building_out
    ** attached_showing
    ** attached_hiding

    @type String
    @default 'unrendered'
    @readonly
  */
  _state: 'unrendered',

  /**
    Whether the view's layer is attached to the DOM or not.

    When the view's layer is attached to the DOM, this value will be true.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isAttached: function () {
    var state = this.get('_state');
    return state.indexOf('attached') === 0;
  }.property('_state').cacheable(),

  /** @private
    Whether the attached view is invisible or becoming invisible because of
    a hidden ancestor.

    @field
    @type Boolean
    @default false
    @readonly
  */
  _isHiddenByAncestor: false,

  /** @private
    Whether the attached view is invisible or becoming invisible because it
    hid itself.

    @field
    @type Boolean
    @default false
    @readonly
  */
  _isHiddenBySelf: function () {
    return !this.get('isShown') && !this.get('_isHiddenByAncestor');
  }.property('_state', '_isHiddenByAncestor').cacheable(),

  /**
    Whether the view's layer exists or not.

    When the view's layer is created, this value will be true.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isRendered: function () {
    var state = this.get('_state');
    return state !== 'unrendered';
  }.property('_state').cacheable(),

  /**
    Whether the attached view is shown or becoming shown.

    When the view is shown in the window, this value will be true.  Note that
    this only applies to rendered and attached views and if the view is
    transitioning out, this value will be false.

    This is not necessarily the same as `isVisible` although the two properties
    are related.  For instance, it's possible to set `isVisible` to `true` and still
    have `isShown` be `false` or vice versa due to the `isShown` state of the view's
    parent view.  Therefore, `isShown` represents the actual visible state of the
    view and `isVisible` is used to attempt to alter that state.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isShown: function () {
    var state = this.get('_state');
    return state === 'attached_shown' || state === 'attached_showing' ||  state === 'attached_building_in';
  }.property('_state').cacheable(),

  // ------------------------------------------------------------------------
  // Actions (Locked down to the proper state)
  //

  /** @private Adopt this view action. */
  _doAdopt: function (parentView, beforeView) {
    var curParentView = this.get('parentView'),
      handled = true;

    if (curParentView && curParentView !== parentView) {
      //@if(debug)
      // This should be avoided, because using the same view instance without explicitly orphaning it first is a dangerous practice.
      SC.warn("Developer Warning: You should not adopt the view %@ to a new parent without removing it from its old parent first.".fmt(this));
      //@endif

      // Force orphaning the view.
      this._executeDoOrphan();
      curParentView = false;
    }

    // You can adopt childViews that have you set as parent, but have not yet been fully adopted.
    if (!curParentView || this.get('childViews').indexOf(this) < 0) {
      this._executeDoAdopt(parentView, beforeView);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Attach this view action. */
  _doAttach: function (parentNode, nextNode) {
    var state = this.get('_state'),
      handled = true;

    if (state === 'unattached') {
      this._executeDoAttach(parentNode, nextNode);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Destroy the layer of this view action. */
  _doDestroyLayer: function () {
    var handled = true;

    if (this.get('isRendered') && !this.get('isAttached')) {
      this._executeDoDestroyLayer();
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Detach this view action. */
  _doDetach: function (immediately) {
    var isAttached = this.get('isAttached'),
      isShown = this.get('isShown'),
      transitionOut = this.get('transitionOut'),
      handled = true;

    if (isAttached) {
      if (isShown && transitionOut && !immediately) {
        // In the shown states, attempt to build out unless told otherwise.
        this._gotoAttachedBuildingOutState();
      } else {
        this._executeDoDetach();
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Hide this view action. */
  _doHide: function () {
    var isShown = this.get('isShown'),
      parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's isShown property.
      isParentShown = parentView ? parentView.get('isShown') : true,
      handled = true;

    if (isShown && isParentShown) {
      this._executeDoHide();
    } else if (this.get('isRendered')) {
      // Queue the update if the view has been rendered.
      if (this.get('isVisible')) { this._visibilityNeedsUpdate = true; }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Orphan this view action. */
  _doOrphan: function () {
    var parentView = this.get('parentView'),
      handled = true;

    if (parentView) {
      this._executeDoOrphan();
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Render this view action. */
  _doRender: function () {
    var isRendered = this.get('isRendered'),
      handled = true;

    if (!isRendered) {
      this._executeDoRender();
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Show this view action. */
  _doShow: function () {
    var isAttached = this.get('isAttached'),
      isShown = this.get('isShown'),
      parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's isShown property.
      isParentShown = parentView ? parentView.get('isShown') : true,
      handled = true;

    if (isAttached && !isShown && isParentShown) {
      this._executeDoShow();
    } else if (this.get('isRendered')) {
      // Queue the update if the view has been rendered.
      if (!this.get('isVisible')) { this._visibilityNeedsUpdate = true; }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Update this view's contents action. */
  _doUpdateContent: function (force) {
    var isRendered = this.get('isRendered'),
      isShown = this.get('isShown'),
      handled = true;

    if (isRendered) {
      if (isShown || this.get('_state') === 'attached_hiding' ||
          this.get('_state') === 'attached_building_out' || force) {
        // Only in the visible states do we allow updates without being forced.
        this._executeDoUpdateContent();
      } else {
        // Otherwise mark the view as needing an update when we enter a shown state again.
        this._contentNeedsUpdate = true;
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Update this view's layout action. */
  _doUpdateLayout: function (force) {
    var isRendered = this.get('isRendered'),
      isShown = this.get('isShown'),
      handled = true;

    if (isRendered) {
      if (isShown || this.get('_state') === 'attached_hiding' ||
          this.get('_state') === 'attached_building_out' || force) {
        // Only in the visible states do we allow updates without being forced.
        this._executeDoUpdateLayout();
      } else {
        // Otherwise mark the view as needing an update when we enter a shown state again.
        this._layoutNeedsUpdate = true;
      }
    } else {
      handled = false;
    }

    return handled;
  },

  // ------------------------------------------------------------------------
  // Events
  //

  /** @private The 'adopted' event. */
  _adopted: function (beforeView) {
    var parentView = this.get('parentView');

    // Notify.
    if (parentView.didAddChild) { parentView.didAddChild(this, beforeView); }
    if (this.didAddToParent) { this.didAddToParent(parentView, beforeView); }

    if (this.get('isAttached')) {

      // Our frame will change once we've been adopted to a parent.
      if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
      else { this.layoutDidChange(); }

    } else {

      // Our frame will change once we've been adopted to a parent.
      if (this.get('hasLayout')) { this.layoutDidChange(); }

      if (this.get('isRendered')) {

        // Bypass the unattached state for adopted views.
        if (parentView.get('isAttached')) {
          var parentNode, nextNode, nextView, siblings;

          parentNode = parentView.get('containerLayer');
          siblings = parentView.get('childViews');
          nextView = siblings.objectAt(siblings.indexOf(this) + 1);
          nextNode = (nextView) ? nextView.get('layer') : null;

          this._executeDoAttach(parentNode, nextNode);
        }
      } else {

        // Bypass the unrendered state for adopted views.
        if (parentView.get('isRendered')) {
          this._executeDoRender();
        }
      }

    }
  },

  /** @private The 'attached' event. */
  _attached: function () {
    // Notify attached (on self and child views).
    this._parentAttached();

    // Route.
    var isVisible = this.get('isVisible'),
      parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's isShown property.
      isParentShown = parentView ? parentView.get('isShown') : true;

    if (isVisible && isParentShown) {
      // Notify shown (on self and child views).
      this._parentAttachedShown();
    } else {
      // If our parent is already hidden, then update _isHiddenByAncestor.
      if (!isParentShown) {
        this.set('_isHiddenByAncestor', true);
      }

      this._gotoAttachedHiddenState();
    }
  },

  /** @private The 'detached' event. */
  _detached:  function () {
    // Stop observing isVisible & isFirstResponder.
    this.removeObserver('isVisible', this, this._isVisibleDidChange);
    this.removeObserver('isFirstResponder', this, this._isFirstResponderDidChange);

    //Route.
    this._gotoUnattachedState();

    // Cascade the event to child views.
    this._callOnChildViews('_detached');
  },

  /** @private The 'detaching' event. */
  _detaching:  function () {
    if (this.willRemoveFromDocument) { this.willRemoveFromDocument(); }

    // Cascade the event to child views.
    this._callOnChildViews('_detaching');
  },

  /** @private The 'didTransitionOut' event. */
  _didTransitionIn: function (transition, options) {
    var state = this.get('_state');

    // Clean up the transition if the plugin supports it.
    if (transition.teardown) {
      transition.teardown(this, options);
    }

    // Route.
    if (state === 'attached_building_in' || state === 'attached_showing') {
      this._gotoAttachedShownState();
    }
  },

  /** @private The 'didTransitionOut' event. */
  _didTransitionOut: function (transition, options) {
    var state = this.get('_state');

    // Clean up the transition if the plugin supports it.
    if (transition.teardown) {
      transition.teardown(this, options);
    }

    // Route.
    if (state === 'attached_building_out') {
      this._executeDoDetach();
    } else if (state === 'attached_hiding') {
      this._gotoAttachedHiddenState();
    }
  },

  /** @private The 'layerDestroyed' event. */
  _layerDestroyed: function () {
    var displayProperties,
      idx, len;

    // Unregister display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.removeObserver(displayProperties[idx], this, this.displayDidChange);
    }

    // Route.
    this._gotoUnrenderedState();

    // Cascade the event to child views.
    this._callOnChildViews('_layerDestroyed');
  },

  /** @private The 'layerDestroying' event. */
  _layerDestroying: function () {
    // Notify.
    if (this.willDestroyLayer) { this.willDestroyLayer(); }
    var mixins = this.willDestroyLayerMixin, len, idx;
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this);
      }
    }

    // Cascade the event to child views.
    this._callOnChildViews('_layerDestroying');
  },

  /** @private The 'orphaned' event. */
  _orphaned: function (oldParentView) {
    // Notify.
    if (oldParentView.didRemoveChild) { oldParentView.didRemoveChild(this); }
    if (this.didRemoveFromParent) { this.didRemoveFromParent(oldParentView); }

    // The DOM will need some fixing up, note this on the view.
    // But don't update the layer location if it's already destroyed (i.e. it
    // no longer has a layer), because if a new layer with the same id were
    // created before updateLayerLocationIfNeeded runs, we would inadvertently
    // remove the new layer.
    // TODO: We should be able to avoid this hack with statechart.
    // if (!this.get('isDestroyed') && this.parentViewDidChange) this.parentViewDidChange();

    if (this.get('isAttached')) {

      // Our frame will change once we've been removed from a parent.
      if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
      else { this.layoutDidChange(); }

    } else {

      // Our frame will change once we've been removed from a parent.
      if (this.get('hasLayout')) { this.layoutDidChange(); }

    }
  },

  /** @private The 'parentAttached' cascading event. */
  _parentAttached: function () {
    // Notify.
    if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
    else { this.layoutDidChange(); }
    if (this.didAppendToDocument) { this.didAppendToDocument(); }

    // Begin observing isVisible & isFirstResponder.
    this.addObserver('isVisible', this, this._isVisibleDidChange);
    this.addObserver('isFirstResponder', this, this._isFirstResponderDidChange);

    // Cascade the event to child views.
    this._callOnChildViews('_parentAttached');
  },

  /** @private The 'parentAttachedShown' cascading event. */
  _parentAttachedShown: function () {
    this.set('_isHiddenByAncestor', false);

    if (this.get('isVisible')) {
      var transitionIn = this.get('transitionIn');

      // Update before showing.
      this._executeQueuedUpdates();

      // Route.
      if (transitionIn) {
        this._gotoAttachedBuildingInState();
      } else {
        this._gotoAttachedShownState();
      }

      // Cascade the event to child views.
      this._callOnChildViews('_parentAttachedShown');
    } else {
      // Route.
      this._gotoAttachedHiddenState();
    }
  },

  /** @private The 'parentHidden' cascading event. */
  _parentHidden: function () {
    this.set('_isHiddenByAncestor', true);

    // Route.
    this._gotoAttachedHiddenState();

    // Cascade the event to child views.
    this._callOnChildViews('_parentHidden');
  },

  /** @private The 'parentShown' cascading event. */
  _parentShown: function () {
    console.log("%@ - _parentShown".fmt(this));
    this.set('_isHiddenByAncestor', false);

    if (this.get('isVisible')) {
      // Update before showing.
      this._executeQueuedUpdates();

      // Route.
      this._gotoAttachedShownState();

      // Cascade the event to child views.
      this._callOnChildViews('_parentAttachedShown');
    }
  },

  /** @private The 'rendered' event. */
  _rendered: function () {
    var displayProperties,
      len, idx,
      mixins = this.didCreateLayerMixin;

    // TODO: we should be able to fix this with states
    // this.notifyPropertyChange('layer');

    // TODO: we should be able to fix this with states
    // if (this.get('useStaticLayout')) this.viewDidResize();

    // Send notice that the layer was created.
    if (this.didCreateLayer) { this.didCreateLayer(); }
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this);
      }
    }

    // Register display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.addObserver(displayProperties[idx], this, this.displayDidChange);
    }

    // var childView, childViews = this.get('childViews');
    // for (var i = childViews.length - 1; i >= 0; i--) {
    //   childView = childViews[i];

    //   // We allow missing childViews in the array so ignore them.
    //   if (!childView) { continue; }

      // A parent view creating a layer might result in the creation of a
      // child view's DOM node being created via a render context without
      // createLayer() being invoked on the child.  In such cases, if anyone
      // had requested 'layer' and it was cached as null, we need to
      // invalidate it.
      // TODO: we should be able to fix this with states
      // childView.notifyPropertyChange('layer');

      // A strange case, that a childView's frame won't be correct before
      // we have a layer, if the childView doesn't have a fixed layout
      // and we are using static layout.
      // TODO: we should be able to fix this with states
      // if (this.get('useStaticLayout')) {
      //   if (!childView.get('isFixedLayout')) { childView.viewDidResize(); }
      // }

    //   childView._rendered();
    // }

    // Route.
    this._gotoUnattachedState();

    // Cascade the event to child views.
    this._callOnChildViews('_rendered');
  },

  /** @private The 'updatedContent' event. */
  _updatedContent: function () {
    // If this view uses static layout, then notify that the frame (likely)
    // changed.
    if (this.useStaticLayout) { this.viewDidResize(); }

    if (this.didUpdateLayer) { this.didUpdateLayer(); }

    if (this.designer && this.designer.viewDidUpdateLayer) {
      this.designer.viewDidUpdateLayer(); //let the designer know
    }
  },

  /** @private The 'updatedLayout' event. */
  _updatedLayout: function () {
    // Notify.
    this.didRenderAnimations();

    // If this view uses static layout, then notify if the frame changed.
    // (viewDidResize will do a comparison)
    if (this.useStaticLayout) this.viewDidResize();

    // Cascade the event to child views.
    this._callOnChildViews('_updatedLayout');
  },

  /** @private The 'updatedVisibility' event. */
  _updatedVisibility: function () {
  },

  // ------------------------------------------------------------------------
  // States
  //

  /** @private */
  _gotoAttachedBuildingInState: function () {
    // Backwards compatibility.
    this.set('isVisibleInWindow', true);

    // Update the state.
    this.set('_state', 'attached_building_in');

    var transitionIn = this.get('transitionIn'),
      options = this.get('transitionInOptions') || {};

    // Prep the transition if the plugin supports it.
    if (transitionIn.setup) {
      transitionIn.setup(this, options);
    }

    // Execute the transition.
    transitionIn.run(this, options);
  },

  /** @private */
  _gotoAttachedBuildingOutState: function () {
    // Update the state.
    this.set('_state', 'attached_building_out');

    var transitionOut = this.get('transitionOut'),
      options = this.get('transitionOutOptions') || {};

    // Prep the transition if the plugin supports it.
    if (transitionOut.setup) {
      transitionOut.setup(this, options);
    }

    // Execute the transition.
    transitionOut.run(this, options);
  },

  /** @private */
  _gotoAttachedHiddenState: function () {
    // console.log('%@ - entered hidden state'.fmt(this));

    // Backwards compatibility.
    this.set('isVisibleInWindow', false);

    // Update the visibility of the layer.
    if (this._visibilityNeedsUpdate) {
      this._executeDoUpdateVisibility();
    }

    // Cascade the event to child views.
    this._callOnChildViews('_parentHidden');

    // Update the state.
    this.set('_state', 'attached_hidden');
  },

  /** @private */
  _gotoAttachedHidingState: function () {
    console.log('%@ - entered hiding state'.fmt(this));
    // Update the state.
    this.set('_state', 'attached_hiding');

    var transitionHide = this.get('transitionHide'),
      options = this.get('transitionHideOptions') || {};

    // Prep the transition if the plugin supports it.
    if (transitionHide.setup) {
      transitionHide.setup(this, options);
    }

    // Execute the transition.
    transitionHide.run(this, options);
  },

  /** @private */
  _gotoAttachedShowingState: function () {
    // console.log('%@ - entered showing state'.fmt(this));
    // Backwards compatibility.
    this.set('isVisibleInWindow', true);

    // Update the state.
    this.set('_state', 'attached_showing');

    var transitionShow = this.get('transitionShow'),
      options = this.get('transitionShowOptions') || {};

    // Prep the transition if the plugin supports it.
    if (transitionShow.setup) {
      transitionShow.setup(this, options);
    }

    // Execute the transition.
    transitionShow.run(this, options);
  },

  /** @private */
  _gotoAttachedShownState: function () {
    // console.log('%@ - entered shown state'.fmt(this));
    // Backwards compatibility.
    this.set('isVisibleInWindow', true);

    // Update the state.
    this.set('_state', 'attached_shown');
  },

  /** @private */
  _gotoUnattachedState: function () {
    // Update the state.
    this.set('_state', 'unattached');
  },

  /** @private */
  _gotoUnrenderedState: function () {
    // Update the state.
    this.set('_state', 'unrendered');
  },

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private Send the 'event' (i.e. call the method recursively on all child views). */
  _callOnChildViews: function (eventName) {
    var args,
      childView, childViews = this.get('childViews'),
      method;

    args = SC.$A(arguments).slice(1);
    for (var i = childViews.length - 1; i >= 0; i--) {
      childView = childViews[i];

      // We allow missing childViews in the array so ignore them.
      if (!childView) { continue; }

      method = childView[eventName];
      method.apply(childView, args);
    }
  },

  /** @private */
  _executeDoAdopt: function (parentView, beforeView) {
    var idx,
      childViews = parentView.get('childViews');

    // Send notifications.
    if (parentView.willAddChild) { parentView.willAddChild(this, beforeView); }
    if (this.willAddToParent) { this.willAddToParent(parentView, beforeView); }

    // Set parentView.
    this.set('parentView', parentView);

    // Add to the new parent's childViews array.
    if (childViews.needsClone) { parentView.set(childViews = []); }
    idx = (beforeView) ? childViews.indexOf(beforeView) : childViews.length;
    if (idx < 0) { idx = childViews.length; }
    childViews.insertAt(idx, this);

    // Notify adopted.
    this._adopted(beforeView);
  },

  /** @private */
  _executeDoAttach: function (parentNode, nextNode) {
    var node = this.get('layer');

      // before we add to parent node, make sure that the nextNode exists...
      // if (nextView && (!nextNode || nextNode.parentNode!==parentNode)) {
      //   nextView.updateLayerLocationIfNeeded();

      //   // just in case it still couldn't generate the layer, force to null, because
      //   // IE doesn't support insertBefore(blah, undefined) in version IE9.
      //   nextNode = nextView.get('layer') || null;
      // }

      // add to parentNode if needed.
      // if ((node.parentNode !== parentNode) || (node.nextSibling !== nextNode)) {
    // jQuery(elem).append(layer)
    parentNode.insertBefore(node, nextNode);
    // }

    // Notify attached.
    this._attached();
  },

  /** @private */
  _executeDoDestroyLayer: function () {
    // Notify destroying layer.
    this._layerDestroying();

    // Remove the layer.
    this.set('layer', null);

    // Notify layer destroyed.
    this._layerDestroyed();
  },

  /** @private */
  _executeDoDetach: function () {
    // Notify detaching.
    this._detaching();

    // Detach the layer.
    var node = this.get('layer');
    node.parentNode.removeChild(node);

    // Notify detached.
    this._detached();
  },

  /** @private */
  _executeDoHide: function () {
    // console.log('_executeDoHide');
    var state = this.get('_state'),
      transition,
      options;

    // Cancel conflicting transitions.
    // TODO: We could possibly cancel to SC.LayoutState.CURRENT if we know that a transitionHide animation is going to run.
    if (state === 'attached_building_in') {
      transition = this.get('transitionIn');
      options = this.get('transitionInOptions') || {};
    } else if (state === 'attached_showing') {
      transition = this.get('transitionShow');
      options = this.get('transitionShowOptions') || {};
    }

    if (transition && transition.cancel) { transition.cancel(this, options); }

    // Route.
    if (this.get('transitionHide')) {
      this._gotoAttachedHidingState();
    } else {
      this._gotoAttachedHiddenState();
    }
  },

  /** @private */
  _executeDoOrphan: function () {
    var parentView = this.get('parentView'),
      childViews = parentView.get('childViews'),
      idx = childViews.indexOf(this);

    // Completely remove the view from its parent.
    this.set('parentView', null);

    // Remove view from old parent's childViews array.
    if (idx >= 0) { childViews.removeAt(idx); }

    // Notify orphaned.
    this._orphaned(parentView);
  },

  /** @private */
  _executeDoRender: function () {
    // Render the layer.
    // this.createLayer();
    var context = this.renderContext(this.get('tagName'));
    this.renderToContext(context);
    this.set('layer', context.element());

    // Notify rendered.
    this._rendered();

    // Bypass the unattached state for adopted views.
    var parentView = this.get('parentView');
    if (parentView && parentView.get('isAttached')) {
      var parentNode = parentView.get('containerLayer'),
        siblings = parentView.get('childViews'),
        nextView = siblings.objectAt(siblings.indexOf(this) + 1),
        nextNode = (nextView) ? nextView.get('layer') : null;

      this._executeDoAttach(parentNode, nextNode);
    }
  },

  /** @private */
  _executeDoShow: function () {
    var state = this.get('_state'),
      transition,
      options;

    // Cascade the event to child views.
    this._callOnChildViews('_parentShown');

    // Update before showing.
    this._executeQueuedUpdates();

    // Cancel conflicting transitions.
    // TODO: We could possibly cancel to SC.LayoutState.CURRENT if we know that a transitionShow animation is going to run.
    if (state === 'attached_hiding') {
      transition = this.get('transitionHide');
      options = this.get('transitionHideOptions') || {};

      if (transition.cancel) { transition.cancel(this, options); }
    }

    if (this.get('transitionShow')) {
      this._gotoAttachedShowingState();
    } else {
      this._gotoAttachedShownState();
    }
  },

  /** @private */
  _executeDoUpdateContent: function () {
    var mixins = this.renderMixin, idx, len,
      context = this.renderContext(this.get('layer'));

    // If there is no update method, fallback to calling render with extra
    // firstTime argument set to false.
    if (!this.update) {
      this.render(context, false);
    } else {
      this.update(context.$());
    }

    // Call renderMixin methods.
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this, context, false);
      }
    }

    // Call applyAttributesToContext so that subclasses that override it can
    // insert further attributes.
    this.applyAttributesToContext(context);

    context.update();
    // if (context._innerHTMLReplaced) {
    //   var pane = this.get('pane');
    //   if (pane && pane.get('isPaneAttached')) {
    //     this._notifyDidAppendToDocument();
    //   }
    // }

    // Reset that an update is required.
    this._contentNeedsUpdate = false;

    // TODO: Deprecate layerNeedsUpdate and remove this.
    this.set('layerNeedsUpdate', NO);

    // Notify updated.
    this._updatedContent();
  },

  /** @private */
  _executeDoUpdateLayout: function () {
    var context = this.renderContext(this.get('layer'));

    context.setStyle(this.get('layoutStyle'));
    context.update();

    // Reset that an update is required.
    this._layoutNeedsUpdate = false;

    // Notify updated.
    this._updatedLayout();
  },

  /** @private */
  _executeDoUpdateVisibility: function () {
    var isVisible = this.get('isVisible');

    this.$().setClass('sc-hidden', !isVisible);
    this.$().attr('aria-hidden', !isVisible);

    // Reset that an update is required.
    this._visibilityNeedsUpdate = false;

    // Notify updated.
    this._updatedVisibility();
  },

  /** @private */
  _executeQueuedUpdates: function () {
    // Update the content of the layer if necessary.
    if (this._contentNeedsUpdate) {
      this._executeDoUpdateContent();
    }

    // Update the layout style of the layer if necessary.
    if (this._layoutNeedsUpdate) {
      this._executeDoUpdateLayout();
    }

    // Update the visibility of the layer if necessary.
    if (this._visibilityNeedsUpdate) {
      this._executeDoUpdateVisibility();
    }
  },


  /** @private
    Marks the view as needing a visibility update if the isVisible property
    changes.

    This observer is connected when the view is attached and disconnected
    when the view is detached.
  */
  _isVisibleDidChange: function () {
    this._visibilityNeedsUpdate = true;

    if (this.get('isVisible')) {
      this._doShow();
    } else {
      this._doHide();
    }
  },

  /** @private
    Adds the 'focus' class to the view.

    This observer is connected when the view is attached and disconnected
    when the view is detached.
  */
  _isFirstResponderDidChange: function () {
    var isFirstResponder = this.get('isFirstResponder');

    this.$().setClass('focus', isFirstResponder);
  }

});
