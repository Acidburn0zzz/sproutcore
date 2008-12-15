// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('design.mode/views/designer');
require('views/controls/label');

SC.LabelView.Designer = SC.ViewDesigner.extend({
  encodeChildViews: NO,
  
  designProperties: 'value escapeHTML'.w()
  
});