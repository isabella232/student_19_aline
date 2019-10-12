(function() {

  chrome.storage.onChanged.addListener(function(changes) {
      if (changes.actionClickAction) {
          setActionClickAction(changes.actionClickAction.newValue);
          return;
      }
      if (changes.showContextMenu) {
          if (changes.showContextMenu.newValue) {
              show();
              chrome.storage.sync.get('contextmenuPatterns', function(items) {
                  updateLinkMenu(items.contextmenuPatterns, true);
              });
          } else {
              hide();
          }
          return;
      }
      if (changes.contextmenuPatterns) {
          // The options page only allows 'contextmenuPatterns' to be edited
          // if 'showContextMenu' is true, so assume that the menu is shown,
          // so we can just edit the menu item.
          updateLinkMenu(changes.contextmenuPatterns.newValue, false);
      }
  });
  chrome.runtime.onInstalled.addListener(checkContextMenuPref);
  chrome.runtime.onStartup.addListener(checkContextMenuPref);
  function checkContextMenuPref() {
      var storageArea = chrome.storage.sync;
      storageArea.get({
          showContextMenu: true,
          actionClickAction: 'popup',
          contextmenuPatterns: [],
      }, function(items) {
          if (items.showContextMenu) {
              show();
              updateLinkMenu(items.contextmenuPatterns, false);
          }
          setActionClickAction(items.actionClickAction);
      });
      chrome.contextMenus.create({
          id: 'certify_webpage',
          parentId: MENU_ID_ACTION_MENU,
          title: 'Certify the whole webpage',
          type: 'radio',
          contexts: ['page_action'],
      });
  }
  function show() {
      chrome.contextMenus.create({
          id: MENU_ID_LINK,
          title: 'View linked extension source',
          contexts: ['link'],
          targetUrlPatterns: DEFAULT_LINK_TARGET_URL_PATTERNS,
      });
      // AMO lists multiple versions, specifically state that this
      // is the latest approved version to avoid ambiguity.
      chrome.contextMenus.create({
          id: MENU_ID_AMO_APPROVED_LINK,
          title: 'View linked extension source (latest approved version)',
          contexts: ['link'],
          targetUrlPatterns: amo_match_patterns,
      });
      chrome.contextMenus.create({
          id: MENU_ID_PAGE,
          title: 'View extension source',
          contexts: ['all'],
          documentUrlPatterns: [
              cws_match_pattern,
              ows_match_pattern,
          ].concat(amo_file_version_match_patterns),
      });
      // AMO lists multiple versions, specifically state that this
      // is the latest approved version to avoid ambiguity.
      chrome.contextMenus.create({
          id: MENU_ID_AMO_APPROVED_PAGE,
          title: 'View extension source (latest approved version)',
          contexts: ['page', 'frame', 'link'],
          documentUrlPatterns: amo_match_patterns,
      });
  }

  function setActionClickAction(actionClickAction) {
      if (!actionClickAction) return;
      chrome.contextMenus.update(actionClickAction, {
          checked: true,
      });
  }
})();
