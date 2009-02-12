// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context */

var context = null;

module("SC.RenderContext#tag", {
  setup: function() {
    context = SC.RenderContext() ;
  },
  
  teardown: function() {
    context = null ;
  }
});

test("should emit a self closing tag.  like calling begin().end()", function() {
  context.tag("div");
  equals(context.get(0), "<div />");
});

test("should respect passed opts when emitting", function() {
  context.tag("foo", { id: "bar" });
  equals(context.length, 1);
  equals("<foo id=\"bar\"  />", context.get(0));
});

test("should NOT emit self closing tag if tag is script", function() {
  context.tag("script");
  equals(context.get(0), '<script>');
  equals(context.get(1), '<'+'/script>');
});
