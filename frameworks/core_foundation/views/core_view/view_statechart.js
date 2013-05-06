sc_require("views/view");


SC.CoreView.mixin(
  /** @scope SC.CoreView */ {

/**
    The view has been created.

    @static
    @constant
  */
  IS_CREATED: 0x0200, // 512

  /**
    The view has been rendered.

    @static
    @constant
  */
  IS_RENDERED: 0x0100, // 256

  /**
    The view has been attached.

    @static
    @constant
  */
  IS_ATTACHED: 0x0080, // 128

  /**
    The view is visible in the display.

    @static
    @constant
  */
  IS_SHOWN: 0x0040, // 64

  /**
    The view is invisible in the display.

    @static
    @constant
  */
  IS_HIDDEN: 0x0020, // 32

  /**
    The view has been created, but has not been rendered or attached.

    @static
    @constant
  */
  UNRENDERED: 0x0200, // 512

  /**
  The view has been created and rendered, but has not been attached
  (i.e. appended to the document).

    @static
    @constant
  */
  UNATTACHED: 0x0300, // 768

  /**
  The view has been created, rendered and attached and is visible in the
  display.

    @static
    @constant
  */
  ATTACHED_SHOWN: 0x03C0, // 960

  /**
  The view has been created, rendered and attached, but is not visible in the
  display.

    @static
    @constant
  */
  ATTACHED_HIDDEN: 0x03A0, // 928

  /**
    The view has been created, rendered and attached, but is not visible in the
    display due to being hidden by a parent view.

    @static
    @constant
  */
  ATTACHED_HIDDEN_BY_PARENT: 0x03A1, // 929

  /**
  The view has been created, rendered and attached and is visible in the
  display.  It is currently transitioning according to the transitionIn
  property before being fully shown (i.e ATTACHED_SHOWN).

    @static
    @constant
  */
  ATTACHED_BUILDING_IN: 0x03C1, // 961

  /**
    The view has been created, rendered and attached.  It is currently
    transitioning according to the transitionOut property before being
    detached (i.e. removed from the document).

    @static
    @constant
  */
  ATTACHED_BUILDING_OUT: 0x0381, // 897

  /**
    The view has been created, rendered and attached.  It is currently
    transitioning according to the transitionOut property before being
    detached (i.e. removed from the document) because a parent view is
    being detached.

    @static
    @constant
  */
  ATTACHED_BUILDING_OUT_BY_PARENT: 0x0382, // 898

  /**
  The view has been created, rendered and attached and is visible in the
  display.  It is currently transitioning according to the transitionShow
  property before being fully shown (i.e ATTACHED_SHOWN).

    @static
    @constant
  */
  ATTACHED_SHOWING: 0x03C2, // 962

  /**
    The view has been created, rendered and attached.  It is currently
    transitioning according to the transitionHide property before being fully
    hidden.

    @static
    @constant
*/
  ATTACHED_HIDING: 0x03A2 // 930

});


SC.CoreView.reopen(
  /** @scope SC.CoreView.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /**
    The current state of the view as managed by its internal statechart.

    In order to optimize the behavior of SC.View, such as only observing display
    properties when in a rendered state or queueing updates when in a non-shown
    state, SC.View includes a simple internal statechart that maintains the
    current state of the view.

    Views have several possible states:

    * SC.CoreView.UNRENDERED
    * SC.CoreView.UNATTACHED
    * SC.CoreView.ATTACHED_SHOWN
    * SC.CoreView.ATTACHED_HIDDEN
    * SC.CoreView.ATTACHED_HIDDEN_BY_PARENT
    * SC.CoreView.ATTACHED_BUILDING_IN
    * SC.CoreView.ATTACHED_BUILDING_OUT
    * SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT
    * SC.CoreView.ATTACHED_SHOWING
    * SC.CoreView.ATTACHED_HIDING

    @type String
    @default SC.CoreView.UNRENDERED
    @readonly
  */
  currentState: SC.CoreView.UNRENDERED,

  /**
    Whether the view's layer is attached to the document or not.

    When the view's layer is attached to the document, this value will be true.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isAttached: function () {
    var state = this.get('currentState');
    return state & SC.CoreView.IS_ATTACHED;
  }.property('currentState').cacheable(),

  //@if(debug)
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
    return !this.get('isVisibleInWindow') && !this.get('_isHiddenByAncestor');
  }.property('currentState', '_isHiddenByAncestor').cacheable(),
  //@endif

  /** @private
    Whether the view's layer exists or not.

    When the view's layer is created, this value will be true.  This includes
    the unattached view state and all of the attached states.

    @field
    @type Boolean
    @default false
    @readonly
  */
  // NOTE: This property is of little value, so it's private in case we decide to toss it.
  _isRendered: function () {
    return this.get('currentState') !== SC.CoreView.UNRENDERED;
  }.property('currentState').cacheable(),

  /**
    Whether the view is fully shown, becoming fully shown or not.

    When the view is shown in the window, this value will be true.  Note that
    this only applies to rendered and attached views and if the view is
    transitioning out or hiding, this value will be also false.

    This is not necessarily the same as `isVisible` although the two properties
    are related.  For instance, it's possible to set `isVisible` to `true` and
    still have `isVisibleInWindow` be `false` or vice versa due to the
    `isVisibleInWindow` state of the view's parent view.  Therefore,
    `isVisibleInWindow` represents the actual visible state of the view and
    `isVisible` is used to attempt to alter that state.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isVisibleInWindow: function () {
    var state = this.get('currentState');
    return state === SC.CoreView.ATTACHED_SHOWN ||
      state === SC.CoreView.ATTACHED_SHOWING ||
      state === SC.CoreView.ATTACHED_BUILDING_IN;
  }.property('currentState').cacheable(),

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
      SC.warn("Developer Warning: You should not adopt the view, %@, to a new parent without removing it from its old parent first.".fmt(this));
      //@endif

      // Force orphaning the view.
      this._doOrphan();
      curParentView = false;
    }

    // You can adopt childViews that have you set as their parent (i.e. created
    // with createChildView()), but have not yet been fully adopted.
    if (!curParentView || this.get('childViews').indexOf(this) < 0) {
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
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Attach this view action. */
  _doAttach: function (parentNode, nextNode) {
    var state = this.get('currentState'),
      handled = true;

    if (state === SC.CoreView.UNATTACHED) {
      var node = this.get('layer');

      // IE doesn't support insertBefore(blah, undefined) in version IE9.
      parentNode.insertBefore(node, nextNode || null);

      // Notify attached.
      this._attached();
      this._callOnChildViews('_attached');
    } else {
      //@if(debug)
      // This should be avoided, because moving the view layer without explicitly removing it first is a dangerous practice.
      SC.warn("Developer Warning: You can not attach the view, %@, to a new node without properly detaching it first.".fmt(this));
      //@endif
      handled = false;
    }

    return handled;
  },

  /** @private Destroy the layer of this view action. */
  _doDestroyLayer: function () {
    var handled = true;

    if (this.get('_isRendered') && !this.get('isAttached')) {
      // Remove our reference to the layer (our self and all our child views).
      this._executeDoDestroyLayer();
      this._callOnChildViews('_executeDoDestroyLayer');
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Detach this view action. */
  _doDetach: function (immediately) {
    var isAttached = this.get('isAttached'),
      handled = true;

    if (isAttached) {
      // Notify detaching (on self and all child views).
      this._notifyDetaching();
      this._callOnChildViews('_notifyDetaching');

      if (!immediately && this.get('isVisibleInWindow') && this.get('transitionOut')) {
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
    var isVisibleInWindow = this.get('isVisibleInWindow'),
      parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's isVisibleInWindow property.
      isParentShown = parentView ? parentView.get('isVisibleInWindow') : true,
      handled = true;

    if (isVisibleInWindow && isParentShown) {
      var state = this.get('currentState'),
        transition,
        options;

      // Prepare to hide (on self and all child views).
      this._prepareToHide();
      this._callOnChildViews('_prepareToHide');

      // Cancel conflicting transitions.
      // TODO: We could possibly cancel to SC.LayoutState.CURRENT if we know that a transitionHide animation is going to run.
      if (state === SC.CoreView.ATTACHED_BUILDING_IN) {
        //@if(debug)
        SC.warn("Developer Warning: The view, %@, was hidden before it could finish transitioning in.  The transitionIn animation was cancelled.".fmt(this));
        //@endif
        transition = this.get('transitionIn');
        options = this.get('transitionInOptions') || {};
      } else if (state === SC.CoreView.ATTACHED_SHOWING) {
        //@if(debug)
        SC.warn("Developer Warning: The view, %@, was hidden before it could finish being shown.  The transitionShow animation was cancelled.".fmt(this));
        //@endif
        transition = this.get('transitionShow');
        options = this.get('transitionShowOptions') || {};
      }

      if (transition && transition.cancel) { transition.cancel(this, options); }

      // Route.
      if (this.get('transitionHide')) {
        this._gotoAttachedHidingState();
      } else {
        this._gotoAttachedHiddenState();

        // Update and route the child views.
        this._callOnChildViews('_routeOnParentHidden');
      }
    } else if (this.get('_isRendered')) {
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
      var childViews = parentView.get('childViews'),
        idx = childViews.indexOf(this);

      // Completely remove the view from its parent.
      this.set('parentView', null);

      // Remove view from old parent's childViews array.
      if (idx >= 0) { childViews.removeAt(idx); }

      // Notify orphaned.
      this._orphaned(parentView);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Render this view action. */
  _doRender: function () {
    var handled = true;

    if (!this.get('_isRendered')) {
      // Render the layer.
      var context = this.renderContext(this.get('tagName'));
      this.renderToContext(context);
      this.set('layer', context.element());

      // Notify rendered (on self and all child views).
      this._rendered();
      this._callOnChildViews('_rendered');

      // Bypass the unattached state for adopted views.
      var parentView = this.get('parentView');
      if (parentView && parentView.get('isAttached')) {
        var parentNode = parentView.get('containerLayer'),
          siblings = parentView.get('childViews'),
          nextView = siblings.objectAt(siblings.indexOf(this) + 1),
          nextNode = (nextView) ? nextView.get('layer') : null;

        this._doAttach(parentNode, nextNode);
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Show this view action. */
  _doShow: function () {
    var isAttached = this.get('isAttached'),
      isVisibleInWindow = this.get('isVisibleInWindow'),
      parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's isVisibleInWindow property.
      isParentShown = parentView ? parentView.get('isVisibleInWindow') : true,
      handled = true;

    if (isAttached && !isVisibleInWindow && isParentShown) {
      var state = this.get('currentState'),
        transition,
        options;

      // Prepare for display (on self and all child views).
      this._prepareToShow();
      this._callOnChildViews('_prepareToShow');

      // Cancel conflicting transitions.
      // TODO: We could possibly cancel to SC.LayoutState.CURRENT if we know that a transitionShow animation is going to run.
      if (state === SC.CoreView.ATTACHED_HIDING) {
        //@if(debug)
        SC.warn("Developer Warning: The view, %@, was shown before it could finish hiding.  The transitionHide animation was cancelled.".fmt(this));
        //@endif
        transition = this.get('transitionHide');
        options = this.get('transitionHideOptions') || {};

        if (transition.cancel) { transition.cancel(this, options); }
      }

      if (this.get('transitionShow')) {
        this._gotoAttachedShowingState();
      } else {
        this._gotoAttachedShownState();
      }

      // Update and route the child views.
      this._callOnChildViews('_routeOnParentShown');
    } else if (this.get('_isRendered')) {
      // Queue the update if the view has been rendered.
      if (!this.get('isVisible')) { this._visibilityNeedsUpdate = true; }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Update this view's contents action. */
  _doUpdateContent: function (force) {
    var isVisibleInWindow = this.get('isVisibleInWindow'),
      handled = true;

    // Legacy.
    this.set('layerNeedsUpdate', true);

    if (this.get('_isRendered')) {
      if (isVisibleInWindow ||
        this.get('currentState') === SC.CoreView.ATTACHED_HIDING ||
        this.get('currentState') === SC.CoreView.ATTACHED_BUILDING_OUT ||
        force) {
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

  // ------------------------------------------------------------------------
  // Events
  //

  /** @private The 'adopted' event. */
  _adopted: function (beforeView) {
    var parentView = this.get('parentView');

    if (this.get('isAttached')) {
      // Our frame may change once we've been adopted to a parent.
      this.notifyPropertyChange('frame');
    } else {

      if (this.get('_isRendered')) {

        // Bypass the unattached state for adopted views.
        if (parentView.get('isAttached')) {
          var parentNode, nextNode, nextView, siblings;

          parentNode = parentView.get('containerLayer');
          siblings = parentView.get('childViews');
          nextView = siblings.objectAt(siblings.indexOf(this) + 1);
          nextNode = (nextView) ? nextView.get('layer') : null;

          this._doAttach(parentNode, nextNode);
        }
      } else {

        // Bypass the unrendered state for adopted views.
        if (parentView.get('_isRendered')) {
          this._doRender();
        }
      }
    }

    // Notify.
    if (parentView.didAddChild) { parentView.didAddChild(this, beforeView); }
    if (this.didAddToParent) { this.didAddToParent(parentView, beforeView); }
  },

  /** @private The 'attached' event. */
  _attached: function () {
    // Route before notify.
    var parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's isVisibleInWindow property.
      isParentShown = parentView ? parentView.get('isVisibleInWindow') : true;

    if (isParentShown) {
      //@if(debug)
      this.set('_isHiddenByAncestor', false);
      //@endif

      if (this.get('isVisible')) {
        // Update before showing.
        this._prepareToShow();

        // Route.
        var transitionIn = this.get('transitionIn');
        if (transitionIn) {
          this._gotoAttachedBuildingInState();
        } else {
          this._gotoAttachedShownState();
        }
      } else {
        // Route.
        this._gotoAttachedHiddenState();
      }
    } else {
      //@if(debug)
      this.set('_isHiddenByAncestor', true);
      //@endif

      // Route.
      this._gotoAttachedHiddenState();
    }

    // Notify attached.
    this._notifyAttached();
  },

  /** @private The 'detached' event. */
  _detached:  function () {
    // Stop observing isVisible & isFirstResponder.
    this.removeObserver('isVisible', this, this._isVisibleDidChange);
    this.removeObserver('isFirstResponder', this, this._isFirstResponderDidChange);

    //Route.
    this._gotoUnattachedState();
  },

  /**
    This method is called by transition plugins when the incoming or showing
    transition completes.  You should only use this method if implementing a
    custom transition plugin.

    @param {SC.TransitionProtocol} transition The transition plugin used.
    @param {Object} options The original options used.  One of transitionShowOptions or transitionInOptions.
  */
  didTransitionIn: function (transition, options) {
    var state = this.get('currentState');

    // Clean up the transition if the plugin supports it.
    if (transition.teardownIn) {
      transition.teardownIn(this, options);
    }

    // Route.
    if (state === SC.CoreView.ATTACHED_BUILDING_IN || state === SC.CoreView.ATTACHED_SHOWING) {
      this._gotoAttachedShownState();
    }
  },

  /**
    This method is called by transition plugins when the outgoing or hiding
    transition completes.  You should only use this method if implementing a
    custom transition plugin.

    @param {SC.TransitionProtocol} transition The transition plugin used.
    @param {Object} options The original options used.  One of transitionHideOptions or transitionOutOptions.
  */
  didTransitionOut: function (transition, options) {
    var state = this.get('currentState');

    // Clean up the transition if the plugin supports it.
    if (transition.teardownOut) {
      transition.teardownOut(this, options);
    }

    // Route.
    if (state === SC.CoreView.ATTACHED_BUILDING_OUT) {
      this._executeDoDetach();
    } else if (state === SC.CoreView.ATTACHED_HIDING) {
      this._gotoAttachedHiddenState();

      // Update and route the child views.
      this._callOnChildViews('_routeOnParentHidden');
    }
  },

  /** @private The 'orphaned' event. */
  _orphaned: function (oldParentView) {
    // Notify.
    if (oldParentView.didRemoveChild) { oldParentView.didRemoveChild(this); }
    if (this.didRemoveFromParent) { this.didRemoveFromParent(oldParentView); }
  },

  /** @private Prepares for hiding. */
  _prepareToHide: function () {
    if (this.get('isVisible')) {
      // Notify.
      if (this.willHideInDocument) { this.willHideInDocument(); }
    } else {
      // There's no need to continue.

      return false;
    }
  },

  /** @private Prepares for display by executing all queued updates. */
  _prepareToShow: function () {
    if (this.get('isVisible')) {
      // Update before showing.
      this._executeQueuedUpdates();
    } else {
      // There's no need to continue.

      return false;
    }
  },

  /** @private The 'rendered' event. */
  _rendered: function () {
    var displayProperties,
      len, idx,
      mixins = this.didCreateLayerMixin;

    // Route.
    this._gotoUnattachedState();

    // Register display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.addObserver(displayProperties[idx], this, this.displayDidChange);
    }

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
  },

  // ------------------------------------------------------------------------
  // States
  //

  /** @private */
  _gotoAttachedBuildingInState: function () {
    // Update the state.
    this.set('currentState', SC.CoreView.ATTACHED_BUILDING_IN);

    var transitionIn = this.get('transitionIn'),
      options = this.get('transitionInOptions') || {};

    // Prep the transition if the plugin supports it.
    if (transitionIn.setupIn) {
      transitionIn.setupIn(this, options);
    }

    // Execute the transition.
    transitionIn.runIn(this, options);
  },

  /** @private */
  _gotoAttachedBuildingOutState: function () {
    // Update the state.
    this.set('currentState', SC.CoreView.ATTACHED_BUILDING_OUT);

    var transitionOut = this.get('transitionOut'),
      options = this.get('transitionOutOptions') || {};

    // Prep the transition if the plugin supports it.
    if (transitionOut.setupOut) {
      transitionOut.setupOut(this, options);
    }

    // Execute the transition.
    transitionOut.runOut(this, options);
  },

  /** @private */
  _gotoAttachedHiddenState: function () {
    // Update the visibility of the layer.
    if (this._visibilityNeedsUpdate) {
      this._executeDoUpdateVisibility();
    }

    // Update the state.
    this.set('currentState', SC.CoreView.ATTACHED_HIDDEN);

    // Notify.
    if (this.didHideInDocument) { this.didHideInDocument(); }
  },

  /** @private */
  _gotoAttachedHidingState: function () {
    // Update the state.
    this.set('currentState', SC.CoreView.ATTACHED_HIDING);

    var transitionHide = this.get('transitionHide'),
      options = this.get('transitionHideOptions') || {};

    // Prep the transition if the plugin supports it.
    if (transitionHide.setupOut) {
      transitionHide.setupOut(this, options);
    }

    // Execute the transition.
    transitionHide.runOut(this, options);
  },

  /** @private */
  _gotoAttachedShowingState: function () {
    // Update the state.
    this.set('currentState', SC.CoreView.ATTACHED_SHOWING);

    var transitionShow = this.get('transitionShow'),
      options = this.get('transitionShowOptions') || {};

    // Prep the transition if the plugin supports it.
    if (transitionShow.setupIn) {
      transitionShow.setupIn(this, options);
    }

    // Execute the transition.
    transitionShow.runIn(this, options);
  },

  /** @private */
  _gotoAttachedShownState: function () {
    // Update the state.
    this.set('currentState', SC.CoreView.ATTACHED_SHOWN);

    // Notify.
    if (this.didShowInDocument) { this.didShowInDocument(); }
  },

  /** @private */
  _gotoUnattachedState: function () {
    // Update the state.
    this.set('currentState', SC.CoreView.UNATTACHED);
  },

  /** @private */
  _gotoUnrenderedState: function () {
    // Update the state.
    this.set('currentState', SC.CoreView.UNRENDERED);
  },

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private */
  _executeDoDestroyLayer: function () {
    var displayProperties,
      idx, len,
      mixins;

    // Notify.
    if (this.willDestroyLayer) { this.willDestroyLayer(); }

    mixins = this.willDestroyLayerMixin;
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this);
      }
    }

    // Remove the layer reference.
    this.set('layer', null);

    // Unregister display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.removeObserver(displayProperties[idx], this, this.displayDidChange);
    }

    // Route.
    this._gotoUnrenderedState();
  },

  /** @private */
  _executeDoDetach: function () {
    // Detach the layer.
    var node = this.get('layer');
    node.parentNode.removeChild(node);

    // Notify detached (on self and all child views).
    this._detached();
    this._callOnChildViews('_detached');
  },

  /** @private */
  _executeDoUpdateContent: function () {
    var mixins = this.renderMixin,
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
      var len = mixins.length;
      for (var idx = 0; idx < len; ++idx) {
        mixins[idx].call(this, context, false);
      }
    }

    // Call applyAttributesToContext so that subclasses that override it can
    // insert further attributes.
    this.applyAttributesToContext(context);

    context.update();

    // Legacy.
    this.set('layerNeedsUpdate', false);

    // Reset that an update is required.
    this._contentNeedsUpdate = false;

    // Notify.
    if (this.didUpdateLayer) { this.didUpdateLayer(); }

    if (this.designer && this.designer.viewDidUpdateLayer) {
      this.designer.viewDidUpdateLayer(); //let the designer know
    }
  },

  /** @private */
  _executeDoUpdateVisibility: function () {
    var isVisible = this.get('isVisible');

    this.$().toggleClass('sc-hidden', !isVisible);
    this.$().attr('aria-hidden', isVisible ? null : true);

    // Reset that an update is required.
    this._visibilityNeedsUpdate = false;
  },

  /** @private */
  _executeQueuedUpdates: function () {
    // Update the content of the layer if necessary.
    if (this._contentNeedsUpdate) {
      this._executeDoUpdateContent();
    }

    // Update the visibility of the layer if necessary.
    if (this._visibilityNeedsUpdate) {
      this._executeDoUpdateVisibility();
    }

    // Notify after updates are done.
    if (this.willShowInDocument) { this.willShowInDocument(); }
  },

  /** @private
    Marks the view as needing a visibility update if the isVisible property
    changes.

    This observer is connected when the view is attached and is disconnected
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

    This observer is connected when the view is attached and is disconnected
    when the view is detached.
  */
  _isFirstResponderDidChange: function () {
    var isFirstResponder = this.get('isFirstResponder');

    this.$().toggleClass('focus', isFirstResponder);
  },

  /** @private Notify on attached. */
  _notifyAttached: function () {
    // If we don't have the layout module then we don't know the frame until appended to the document.
    this.notifyPropertyChange('frame');

    // Notify.
    if (this.didAppendToDocument) { this.didAppendToDocument(); }

    // Begin observing isVisible & isFirstResponder.
    this.addObserver('isVisible', this, this._isVisibleDidChange);
    this.addObserver('isFirstResponder', this, this._isFirstResponderDidChange);
  },

  /** @private Notify on detaching. */
  _notifyDetaching: function () {
    if (this.willRemoveFromDocument) { this.willRemoveFromDocument(); }
  },

  /** @private Route on parent hidden. */
  _routeOnParentHidden: function () {
    //@if(debug)
    this.set('_isHiddenByAncestor', true);
    //@endif

    if (this.get('isVisible')) {
      // Route.
      this._gotoAttachedHiddenState();
    } else {
      // There's no need to continue, all further child views are already in hidden state.
      return false;
    }
  },

  /** @private Route on parent shown. */
  _routeOnParentShown: function () {
    //@if(debug)
    this.set('_isHiddenByAncestor', false);
    //@endif

    if (this.get('isVisible')) {
      // Route.
      this._gotoAttachedShownState();
    } else {
      // There's no need to continue, all further child views are already in hidden state.
      return false;
    }
  }

});
