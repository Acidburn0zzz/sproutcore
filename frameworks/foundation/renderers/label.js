// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since Quilmes
*/
sc_require("renderers/renderer");
SC.BaseTheme.Label = SC.Renderer.extend({
  name: 'label',

  init: function(attrs) {
    this.titleRenderer = this.theme.Title.create();
    this.attr(attrs);
  },


  updateTitleRenderer: function() {
    var text = this.value,
        hint = this.hint,
        icon = this.icon,
        escapeHTML = this.escapeHTML,
        classes, styleHash;
    
    this.titleRenderer.attr({
      title: text,
      icon: icon,
      escapeHTML: escapeHTML,
      hint: hint
    });
  },
  
  render: function(context) {
    this.renderClassNames(context);
    this.updateTitleRenderer();

    context.addStyle({
      'textAlign': this.textAlign,
      'fontWeight': this.fontWeight,
      'opacity': this.classNames.contains('editing') ? 0 : 1
    });
    context.setClass("icon", !!this.icon);

    this.titleRenderer.render(context);
  },
  
  update: function(cq) {
    this.updateClassNames(cq);

    this.updateTitleRenderer(cq);
    if (this.didChange('text-align')) {
      cq.css('text-align', this.textAlign);
    }
    if (this.didChange('font-weight')) {
      cq.css('font-weight', this.fontWeight);
    }
    if (this.didChange('opacity')) {
      cq.css('opacity', this.isEditing ? 0 : 1);
    }
    if (this.didChange('icon')) {
      cq.setClass("icon", !!this.icon);
    }
    this.resetChanges();
  },
  
  updateTitle: function(cq) {
    this.titleRenderer.update(cq);
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Label);

