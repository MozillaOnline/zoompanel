/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
if (typeof ceZoomPanel == "undefined") {
  var ceZoomPanel = {
    handleEvent: function ZoomPanel__handleEvent(aEvent) {
      switch (aEvent.type) {
        case "activate":
          var mark = Application.prefs.getValue("extensions.zoompanel.global", false);
          if (mark)
            this.onLocationChange();
          break;
        case "aftercustomization":
          this.initUI();
          break;
      }
    },

    init: function ZoomPanel__init() {
      window.addEventListener("activate", this, false);
      window.removeEventListener("load", this, false);
      var _onLocationChange = FullZoom.onLocationChange.bind(FullZoom);
      FullZoom.onLocationChange = (function(aURI, aIsTabSwitch, aBrowser) {
        var mark = Application.prefs.getValue("extensions.zoompanel.global", false);
        if (mark) {
          ceZoomPanel.onLocationChange(aURI, aIsTabSwitch, aBrowser);
        } else {
          _onLocationChange(aURI, aIsTabSwitch, aBrowser);
        }
      }).bind(FullZoom);

      var _setZoomForBrowser = ZoomManager.setZoomForBrowser.bind(ZoomManager);
      ZoomManager.setZoomForBrowser = (function(aBrowser, aVal) {
        _setZoomForBrowser(aBrowser, aVal);
        Application.prefs.setValue("extensions.zoompanel.global.value", aVal * 100);
      }).bind(ZoomManager);

      this.installButton("tczoompanel");
      this.initUI();
      var toolbox = document.getElementById("navigator-toolbox");
      toolbox.addEventListener("aftercustomization",this,false)
    },

    onLocationChange: function ZoomPanel__onLocationChange(aURI, aIsTabSwitch, aBrowser) {
      let browser = aBrowser || gBrowser.selectedBrowser;
      var val = Application.prefs.getValue("extensions.zoompanel.global.value", 100) / 100;
      FullZoom._applyPrefToSetting ? FullZoom._applyPrefToSetting(val, browser) : FullZoom._applyPrefToZoom(val, browser);
    },

    switchGlobal: function ZoomPanel__switchGlobal() {
      var mark = !Application.prefs.getValue("extensions.zoompanel.global", false);
      Application.prefs.setValue("extensions.zoompanel.global", mark);
    },

    onpopupshowing: function ZoomPanel__onpopupshowing() {
      /** workaround for @checked related bug on mac */
      document.getElementById("tczoompanel_global").removeAttribute("checked");
      document.getElementById("tczoompanel_zoom_50").removeAttribute("checked");
      document.getElementById("tczoompanel_zoom_100").removeAttribute("checked");
      document.getElementById("tczoompanel_zoom_125").removeAttribute("checked");
      document.getElementById("tczoompanel_zoom_150").removeAttribute("checked");
      document.getElementById("tczoompanel_zoom_200").removeAttribute("checked");
      document.getElementById("tczoompanel_zoom_300").removeAttribute("checked");
      /* workaround **/
      setTimeout(function() {
        var val = ZoomManager.zoom;
        var mark = Application.prefs.getValue("extensions.zoompanel.global", false);
        if (!mark)
          Application.prefs.setValue("extensions.zoompanel.global.value", val * 100);
        document.getElementById("tczoompanel_global").setAttribute("checked", mark);
        switch(val) {
          case 0.5 :
            document.getElementById("tczoompanel_zoom_50").setAttribute("checked", "true");
            break;
          case 0.75 :
            document.getElementById("tczoompanel_zoom_75").setAttribute("checked", "true");
            break;
          case 1 :
            document.getElementById("tczoompanel_zoom_100").setAttribute("checked", "true");
            break;
          case 1.25 :
            document.getElementById("tczoompanel_zoom_125").setAttribute("checked", "true");
            break;
          case 1.5 :
            document.getElementById("tczoompanel_zoom_150").setAttribute("checked", "true");
            break;
          case 2 :
            document.getElementById("tczoompanel_zoom_200").setAttribute("checked", "true");
            break;
          case 3 :
            document.getElementById("tczoompanel_zoom_300").setAttribute("checked", "true");
            break;
          default:
            //uncheck all
            document.getElementById("tczoompanel_zoom_100").setAttribute("checked", "true");
            document.getElementById("tczoompanel_zoom_100").setAttribute("checked", "false");
            break;
        }
      }, 10);
    },

    reduce: function ZoomPanel__reduce() {
      FullZoom.reduce();
    },

    enlarge: function ZoomPanel__enlarge() {
      FullZoom.enlarge();
    },

    reset: function ZoomPanel__reset() {
      FullZoom.reset();
    },

    zoomTo: function ZoomPanel__zoomTo(val) {
      ZoomManager.zoom = val;
    FullZoom._applySettingToPref ? FullZoom._applySettingToPref() : FullZoom._applyZoomToPref(gBrowser.selectedBrowser);
    },

    installButton: function ZoomPanel__installButton(buttonId,toolbarId) {
      toolbarId = toolbarId || "addon-bar";
      var key = "extensions.toolbarbutton.installed." + buttonId;
      if (Application.prefs.getValue(key, false))
        return;

      var toolbar = window.document.getElementById(toolbarId);
      let curSet = toolbar.currentSet;
      if (-1 == curSet.indexOf(buttonId)) {
        let newSet = curSet + "," + buttonId;
        toolbar.currentSet = newSet;
        toolbar.setAttribute("currentset", newSet);
        document.persist(toolbar.id, "currentset");
        try {
          BrowserToolboxCustomizeDone(true);
        } catch(e) {}
      }
      if (toolbar.getAttribute("collapsed") == "true") {
        toolbar.setAttribute("collapsed", "false");
      }
      document.persist(toolbar.id, "collapsed");
      Application.prefs.setValue(key, true);
    },

    initUI: function ZoomPanel__initUI() {
      this.bindPopup("tczoompanel", "tczoompanel_Popup");
    },

    bindPopup: function ZoomPanel__bindPopup(buttonId, menuId) {
      var button = document.getElementById(buttonId)
      if (!button)
        return;
      var menu = document.getElementById(menuId)
      button.addEventListener("mousedown", function(aEvent) {
        if (aEvent.button != 0)
          return;
        menu.openPopup(button, "before_start", 0, 0, false, false, aEvent);
      },false);
    }
  };

  window.addEventListener("load", function() { ceZoomPanel.init(); }, false);
};

