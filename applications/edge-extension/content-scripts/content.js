/**
 * The code below will be executed inside the page itself.
 * 
 * It communicates with the popup script with the send response and with the request.
 */

/**
 * Retrieves the content on the page and send it back to the extension for 
 * @param {object} request with the data to be sent to the content script inside the tab
 * @param {*} sender 
 * @param {() => void} sendResponse the callback function to send the response back to the content script in the popup
 */
function extractJobPostingInformation(request, sender, sendResponse) {
  console.log('extractJobPostingInformation', 'request', request);

  if (request && request.type && request.type === 'GET_PAGE_CONTENT') {
    const pageContent = document.body.innerText;

    console.log('extractJobPostingInformation', 'sendResponse', 'pageContent', pageContent);
    sendResponse({ pageContent: pageContent });
    return;
  }
}

if (!chrome) {
  console.error('This script requires the chrome API.');
} else {
  chrome.runtime.onMessage.addListener(extractJobPostingInformation);
}
