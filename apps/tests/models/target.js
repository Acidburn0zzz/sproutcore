// ==========================================================================
// Project:   TestRunner.Target
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Describes a target in the build system.

  @extends SC.Record
*/
TestRunner.Target = SC.Record.extend(
/** @scope TestRunner.Target.prototype */ {

  primaryKey: "name",
  
  /**
    Name of target.  This is also the primary key.
  */
  name: SC.Record.attr(String),
  
  /**
    Parent of target.  Only non-null for nested targets.
  */
  parent: SC.Record.toOne("TestRunner.Target"),
  
  /**
    Children of this target.  Computed by getting the loaded targets
  */
  children: function() {
    var store = this.get('store');
    return store.findAll(TestRunner.Target).filterProperty('parent', this);
  }.property().cacheable(),
  
  /**
    Display name for this target
  */
  displayName: function() {
    return this.get('name').slice(1).titleize();
  }.property('name').cacheable(),
  
  /**
    The icon to display.  Based on the type.
  */
  targetIcon: function() {
    var ret = 'sc-icon-document-16';
    switch(this.get('kind')) {
      case "framework":
        ret = 'sc-icon-folder-16';
        break;
        
      case "app":
        ret = 'sc-icon-options-16';
        break;
    }
    return ret ;
  }.property('kind').cacheable()

}) ;
