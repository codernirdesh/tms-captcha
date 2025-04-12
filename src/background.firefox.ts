// Firefox background script
// This script is required for Firefox manifest v2 compatibility
// It handles browser extension lifecycle events

if (typeof browser !== "undefined") {
  browser.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
  });
}