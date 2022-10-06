/**
 * awsvpn-tabscloser
 *
 * Close the tab with receiving the page with: 'Authentication details received, processing details.
 * You may close this window at any time.' from AWS VPN Client
 *
 * @version 0.0.1
 * @author Justin Chu
 * 20220923
 */

const awsvpnUrls = [ 'http://127.0.0.1:35001/', 'https://127.0.0.1:35001/' ];

// Assuming the result returns as:
// Authentication details received, processing details. You may close this window at any time.
const filterMessages = [ "You may close this window at any time." ];

const filterUrls = getFilterUrls();
const queryInfoUrls = getQueryInfoUrls();

chrome.runtime.onInstalled.addListener(() => {
  queryAllTabsAndCloseAwsVpnTabs();
});

chrome.runtime.onStartup.addListener(() => {
  queryAllTabsAndCloseAwsVpnTabs();
});

chrome.webNavigation.onCompleted.addListener((details) => {
  closeAwsVpnTabWithCloseAtAnyTime(details.tabId, details.url);
}, { url: filterUrls });

function getFilterUrls() {
  let urls = [];
  for (let i=0; i<awsvpnUrls.length; i++) {
    urls.push({ urlMatches: awsvpnUrls[i], });
  }
  return urls;
}

function getQueryInfoUrls() {
  let urls = [];
  for (let i=0; i<awsvpnUrls.length; i++) {
    urls.push(awsvpnUrls[i] + '*');
  }
  return urls;
}

function queryAllTabsAndCloseAwsVpnTabs() {
  chrome.tabs.query({ url: queryInfoUrls }, function(tabs) {
    for (let i=0; i<tabs.length; i++) {
      closeAwsVpnTabWithCloseAtAnyTime(tabs[i].id, tabs[i].url);
    }
  });
}

function closeAwsVpnTabWithCloseAtAnyTime(tabId, url) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: getResponseBodyInnerHtml,
  },
  (injectionResults) => {
    for (const injectionResult of injectionResults) {
      for (let i=0; i<filterMessages.length; i++) {
        if (injectionResult.result.includes(filterMessages[i])) {
          console.info(new Date() + " : closing " + url);
          chrome.tabs.remove(tabId);
          break;
        }
      }
    }
  });
}

function getResponseBodyInnerHtml() {
  return document.body.innerHTML;
}
