// ==========================================================================
// Project:   Greenhouse - appPage
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals Greenhouse */
require('views/list_item');
require('views/web');
require('views/tear_off_picker');
require('mixins/drop_down');
require('views/simple_button');
// This page has the main UI layout
Greenhouse.appPage = SC.Page.design({
  
  mainView: SC.View.design({
    childViews: 'mainContainer toolBar'.w(),
    defaultResponder: "Greenhouse",
    
    mainContainer: SC.ContainerView.design({
      layout: { left: 0, top: 32, right: 0, bottom: 0 },
      nowShowingBinding: 'Greenhouse.fileController.editorMode' 
    }),
    
    toolBar: SC.ToolbarView.design(SC.Border, {
      anchorLocation: SC.ANCHOR_TOP,
      borderStyle: SC.BORDER_BOTTOM,

      childViews: 'project action run library title inspector'.w(),
      
      project: SC.ButtonView.design({
        title: "_Project".loc(),
        layout: {left: 75, width: 90, height: 24, top: 4},
        action: 'openProjectPicker'
      }),
      
      title: SC.LabelView.design({
        layout: {centerX: 0, top: 4, height: 24, width: 150},
        valueBinding: SC.Binding.oneWay('Greenhouse.fileController.name')
      }),
      
      run: SC.ButtonView.design({
        title: "_Run".loc(),
        layout: {right: 120, top: 4, width: 45, height: 24},
        titleMinWidth: 30,
        action: 'run'
      }),
      
      inspector: SC.ButtonView.design({
        title: "_Inspector".loc(),
        layout: {right: 300, width: 90, height: 24, top: 4},
        action: 'openInspector'
      }),
      
      library: SC.ButtonView.design({
        title: "_Library".loc(),
        layout: {right: 180, width: 90, height: 24, top: 4},
        action: 'openLibrary'
      }),
      
      action: SC.ButtonView.design(Greenhouse.DropDown, {
        layout: {right: 5, top: 4, width: 90, height: 24},
        titleMinWidth: 0,
        hasIcon: YES,
        title: "_Actions".loc(),
        icon: 'actions-icon',
        dropDown: SC.MenuPane.design({
          defaultResponder: 'Orion',
          layout: { width: 150, height: 0 },
          itemTitleKey: 'title',
          itemTargetKey: 'target',
          itemActionKey: 'action',
          itemSeparatorKey: 'isSeparator',
          itemIsEnabledKey: 'isEnabled',
          items:[
            {title: "_Run".loc(), action: 'run', isEnabled: YES},
            {title: "_Dock Library".loc(), action: 'toggleDockedLibrary', isEnabled: YES},
            {title: "_Dock Inspector".loc(), action: 'toggleDockedInspector', isEnabled: YES},
            {title: "_Save".loc(), action: 'save', isEnabled: YES }
          ]
        })
      }),
      save: SC.ButtonView.design({
        title: "_Save".loc(),
        layout: {right: 5, top: 4, width: 100, height: 24},
        action: 'save'
      })
      
    })
    
  }),
  
  // Outlets to design views
  designAreaView: SC.outlet('pageDesigner.designArea'),
  webView: SC.outlet('pageDesigner.designArea.web'),
  eventBlocker: SC.outlet('pageDesigner.designArea.eventBlocker'),
  
  // Outlets to Docks
  dockView: SC.outlet('pageDesigner.dock'),
  libraryDockView: SC.outlet('pageDesigner.dock.libraryArea'),
  inspectorDockView: SC.outlet('pageDesigner.dock.inspectorArea'),
  
  pageDesigner: SC.View.design({
    layout: { left: 0, top: 0, right: 0, bottom: 0 },
    childViews: 'designArea dock'.w(),
    
    designArea: SC.View.design({
      layout: {top: 0, left: 0, right: 0, bottom: 0},
      childViews: 'web eventBlocker'.w(),

      web: Greenhouse.WebView.design({
        valueBinding:'Greenhouse.targetController.appUrl'
      }),

      eventBlocker: Greenhouse.EventBlocker.design({})
    }),
    
    dock: SC.View.design({
      layout: {top: 0, bottom: 0, right: 0, width: 0},
      childViews: 'libraryArea inspectorArea'.w(),

      libraryArea: SC.ContainerView.design({
        layout: { left: 0, top: 0, right: 0, bottom: 350 },
        nowShowing: null
      }),

      inspectorArea: SC.ContainerView.design({
        layout: { right: 0, bottom: 0, left: 0, height: 350 },
        nowShowing: null
      })
    })
  }),
  
  inspectorContentView: SC.View.design({
    childViews: 'toolbar content'.w(),
  
    toolbar: SC.View.design({
      layout: {top:0, left: 0, right:0, height: 28},
      isVisible: NO,
      childViews: 'title remove'.w(),
      title: SC.LabelView.design({
        layout: {centerX: 0, top: 2, height: 24, width: 50},
        title: "_Inspector".loc()
      }),
      
      remove: SC.View.design(Greenhouse.SimpleButton,{
        layout: {right: 5, top: 2, width: 20, height: 24},
        action: 'closeInspector'
      })
    }),
  
    content: SC.TabView.design({
      layout: {left: 0, right:0, bottom: 0, height:350},
      itemTitleKey: 'title',
      itemValueKey: 'value',
      nowShowing: 'Greenhouse.inspectorsPage.layoutInspector',
      items: [
        {title: "Layout", value: 'Greenhouse.inspectorsPage.layoutInspector'},
        {title: "All Properties", value: 'Greenhouse.inspectorsPage.propertiesInspector'}]
    })
  }),
  
  // inspectorTab: SC.TabView.design({
  //   layout: {left: 0, right:0, bottom: 0, height:350},
  //   itemTitleKey: 'title',
  //   itemValueKey: 'value',
  //   nowShowing: 'Greenhouse.inspectorsPage.layoutInspector',
  //   items: [
  //     {title: "Layout", value: 'Greenhouse.inspectorsPage.layoutInspector'},
  //     {title: "All Properties", value: 'Greenhouse.inspectorsPage.propertiesInspector'}]
  // }),
  
  inspectorPickerContentView: SC.outlet('inspectorPicker.contentView'), 
  inspectorPicker: Greenhouse.TearOffPicker.design({
    layout: {width: 300, height: 380},
    defaultResponder: 'Greenhouse',
    dragAction: 'floatInspector',
    contentView: SC.ContainerView.design({
      nowShowing: 'Greenhouse.appPage.inspectorContentView'
    })
  }),
  
  // ..........................................................
  // Library Views
  // 
  libraryContentView: SC.View.design({
    childViews: 'toolbar content'.w(),
    
    toolbar: SC.View.design({
      layout: {top:0, left: 0, right:0, height: 28},
      isVisible: NO,
      childViews: 'remove'.w(),
      remove: SC.View.design(Greenhouse.SimpleButton,{
        layout: {right: 5, top: 2, width: 20, height: 24},
        action: 'closeLibrary'
      })
    }),
    
    content: SC.View.design({
      childViews: 'title library libSearch addCustomView'.w(),
    
      title: SC.LabelView.design({
        layout: {top: 4, left: 5, width: 50, height: 22},
        value: "_Library".loc()
      }),
    
      libSearch: SC.TextFieldView.design({
        layout: {top: 2, left: 60, right: 5, height: 24},
        valueBinding: 'Greenhouse.libraryController.search'
      }),
    
      library: SC.ScrollView.design({
        layout: {top: 30, left: 0, right: 0, bottom: 40},
        hasHorizontalScroller: NO,
        contentView: SC.ListView.design({
          rowHeight: 36,
          isEditable: NO,
          contentValueKey: 'name',
          contentBinding: 'Greenhouse.libraryController.arrangedObjects',
          selectionBinding: 'Greenhouse.libraryController.selection',
          delegate: Greenhouse.libraryController,
          canReorderContent: YES,
          dragDidBegin: function(drag, loc) {
            Greenhouse.sendAction('cancel');
          }
        })
      }),
    
      addCustomView: SC.ButtonView.design({
        layout: { bottom: 5, right: 5, height: 24, width: 90 },
        titleMinWidth: 0,
        hasIcon: NO,
        title: "_Add View".loc(),
        action: 'newCustomView'
      })
    })
  }),
  
  libraryPickerContentView: SC.outlet('libraryPicker.contentView'),
  libraryPicker: Greenhouse.TearOffPicker.design({
    layout: {width: 230, height: 400},
    dragAction: 'floatLibrary',
    defaultResponder: 'Greenhouse',
    contentView: SC.ContainerView.design({
      nowShowing: 'Greenhouse.appPage.libraryContentView'
    })
  }),
  
  // ..........................................................
  // Project Views
  // 
  projectPicker: SC.PickerPane.design({
    layout: {width: 200, height: 500},
    defaultResponder: 'Greenhouse',
    modalPaneDidClick: function(evt) {
      var f = this.get("frame");
      if(!this.clickInside(f, evt)){ 
        Greenhouse.sendAction('cancel');
      }
      return YES ; 
    },
    contentView: SC.View.design({
      childViews: 'fileList addPage'.w(),

      fileList: SC.ScrollView.design({
        layout: { top: 0, bottom: 32, left: 0, right: 0 },
        hasHorizontalScroller: NO,
        contentView: SC.ListView.design({
          exampleView: Greenhouse.ListItem,
          isEditable: NO,
          canEditContent: YES,
          actOnSelect: YES,
          //canReorderContent: YES,
          deelegate: Greenhouse.filesController,
          contentValueKey: 'name',
          contentBinding: 'Greenhouse.filesController.arrangedObjects',
          selectionBinding: 'Greenhouse.filesController.selection',
          action: 'selectFile'
       })
      }), 
      addPage: SC.ButtonView.design({
        layout: { bottom: 5, right: 5, height: 24, width: 90 },
        titleMinWidth: 0,
        hasIcon: NO,
        title: "_Add Page...".loc(),
        action: 'newPageFile'
      })

      // fileActions: SC.ButtonView.design(Greenhouse.DropDown, {
      //   layout: { bottom: 5, left: 10, height: 24, width: 35 },
      //   titleMinWidth: 0,
      //   hasIcon: NO,
      //   title: '+',
      //   icon: 'file-actions-icon',
      //   dropDown: SC.MenuPane.design({
      //     defaultResponder: 'Greenhouse',
      //     contentView: SC.View.design({}),
      //     layout: { width: 140, height: 0 },
      //     itemTitleKey: 'title',
      //     itemActionKey: 'action',
      //     itemSeparatorKey: 'isSeparator',
      //     itemIsEnabledKey: 'isEnabled',
      //     items: [
      //       { title: "_New File".loc(), action: 'newFile', isEnabled: YES },
      //       { title: "_New Page File".loc(), action: 'newPageFile', isEnabled: YES },
      //       { title: "_New Folder".loc(), action: 'newFolder', isEnabled: YES },
      //       { title: "_Delete".loc(), action: 'deleteFile', isEnabled: YES }
      // 
      //     ]
      //   })
      // })
    })
  })
});
