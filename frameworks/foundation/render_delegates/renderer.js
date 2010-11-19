SC.RendererRenderDelegate = SC.Object.extend({
  render: function(view, context) {
    var rendererName = this.get('rendererName');
    var renderer = view.get('theme').renderer(rendererName);

    renderer.attr(view.getChangedDisplayProperties());
    renderer.render(context);

    view._scrrd_renderer = renderer;
  },

  update: function(view, elem) {
    var renderer = view._scrrd_renderer;

    renderer.attr(view.getChangedDisplayProperties());
    renderer.update(elem);
  }
});