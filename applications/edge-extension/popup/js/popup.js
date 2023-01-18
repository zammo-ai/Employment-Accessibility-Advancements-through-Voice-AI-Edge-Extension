/**
 * Encapsulates the logic for processing the job application
 * @requires tabs permission in the manifest and permission to be approved.
 */
// --------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------
// Constants
const USER_ID_LOCAL_STORAGE_KEY = 'USER_ID_LOCAL_STORAGE_KEY';
const WEBCHAT_ID_LOCAL_STORAGE_KEY = 'WEBCHAT_ID_LOCAL_STORAGE_KEY';
const IS_SIMULATOR_STORAGE_KEY = 'IS_SIMULATOR_STORAGE_KEY';

// --------------------------------------------------------------------------------------------------------------------
// Page objects
// we will define at the top a few of the key page objects we will use in the script.
const reviewJobPostingButton = document.getElementById('review-current-job-posting');
const notification = document.getElementById('notification');

// --------------------------------------------------------------------------------------------------------------------
// Helper functions
function showNotification(message) {
  if (notification) {
    notification.innerText = message;
    notification.style.display = 'block';
    if (notification.className.indexOf('error') === -1) {
      notification.className += ' error';
    }
  }

  console.warn(message);
}

function onDocumentReady(cb) {
  if (document.readyState !== 'loading') {
    cb();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', cb);
  } else {
    document.attachEvent('onreadystatechange', function () {
      if (document.readyState !== 'loading')
        cb();
    });
  }
}

// --------------------------------------------------------------------------------------------------------------------
// Popup logic

function factoryResetBot(zammoBotUIInstance) {
  localStorage.removeItem(WEBCHAT_ID_LOCAL_STORAGE_KEY);
  localStorage.removeItem(IS_SIMULATOR_STORAGE_KEY);
  zammoBotUIInstance.clearStickyLocalStorageInfo();

  const zammoNotUIComponent = document.querySelector('#zammoBotUIComponent');
  zammoNotUIComponent.parentNode.removeChild(zammoNotUIComponent);

  let zammoBotUIKitLocalStorageKeys = [];
  for ( let i = 0, len = localStorage.length; i < len; i++ ) {
    const localStorageKey = localStorage.key( i );
    zammoBotUIKitLocalStorageKeys.push(localStorageKey);
  }

  for (const localStorageKey of zammoBotUIKitLocalStorageKeys) {
    localStorage.removeItem(localStorageKey);
  }

  showWebchatIdForm();
  setupWebchatIdHandler();
}
/**
 * This function will encapsulate the behavior when the user
 * clicks on the factory reset button that is added in the extension menu
 * of the chat bot.
 */
function onFactoryResetExtensionMenuClick(zammoBotUIInstance) {
  const chatBody = '<div id="zammoBotUIComponent--chatFrame--header--extension-menu--options--factory-reset--content">' + 
                    '<span>By confirming, you agree to remove the currently saved data for the bot. Your recent conversations will be deleted. You will need to provide a webchat ID and simulator token again.</span>' +
                   '</div>';
  const chatModal = new ZammoBotUIKit.ZammoBotUIModal({
    'title': '<h2>Do you want to complete reset the bot?</h2>',
    'body': chatBody,
    'confirmButtonLabel': 'Yes',
    'onConfirmButtonClick': function () {
      factoryResetBot(zammoBotUIInstance)
    },
    'styles': [
      {
        'selector': '#zammoBotUIComponent--chatFrame--header--extension-menu--options--factory-reset--content',
        'content': 'display: flex;flex-direction: column;margin-bottom: 5%;'
      },
      {
        'selector': '#zammoBotUIComponent--chatFrame--header--extension-menu--options--factory-reset--content span',
        'content': 'margin-bottom: 5%;text-align: justify;'
      }
    ]
  });

  if (zammoBotUIInstance.chatFrame.id) {
    chatModal.displayModal('#' + zammoBotUIInstance.chatFrame.id);
  }
}

/**
 * This function handles the initialization of the Zammo chatbot.
 * It uses the Zammo UI Kit capabilities.
 * More information available on this documentation: https://cdn.zammo.ai/zammo-bot-ui-kit/zammo-bot-ui-kit.doc-latest.html
 */
function initializeBot(webchatId, isSimulator) {
  const ZammoBotUIKit = window.ZammoBotUIKit;

  const zammoBotUI = ZammoBotUIKit.initialize(webchatId);

  if (isSimulator === 'true') {
    zammoBotUI.logger.log('ZammoBotUIKit.ZammoBotUI.initializeBot::', 'the extension will be using the simulator version of the bot.');

    zammoBotUI.simulatorToken = webchatId;
  }

  zammoBotUI.shouldShowExtensionMenu = true;
  
  zammoBotUI.shouldAllowUserToDownloadTranscript = true;

  zammoBotUI.run();

  if (!zammoBotUI.isChatOpen()) {
    zammoBotUI.openChat();
  }

  zammoBotUI.addExtensionMenuOption('Microphone', function() {
    const getPermissionUrl = chrome.runtime.getURL('popup/get-microphone-permission.html');

    chrome.tabs.create({ url: getPermissionUrl, active: true });
  });

  const factoryResetExtensionMenuId = 'zammoBotUIComponent--chatFrame--header--extension-menu--options--factory-reset';
  zammoBotUI.addExtensionMenuOption('Factory reset', function() {
    onFactoryResetExtensionMenuClick(zammoBotUI);
  }, factoryResetExtensionMenuId);
}

function hideWebchatIdForm() {
  const webchatIdForm = document.querySelector('#webchat-id-form');

  if (webchatIdForm) {
    webchatIdForm.style.display = 'none';
  }

  if (notification) {
    notification.style.display = 'none';
  }
}

function showWebchatIdForm() {
  const webchatIdForm = document.querySelector('#webchat-id-form');

  if (webchatIdForm) {
    webchatIdForm.style.display = 'flex';
  }
}

function setupWebchatIdHandler() {
  const webchatIdInput = document.querySelector('#webchat-id-form input');
  const webchatIdInputSubmitButton = document.querySelector('#webchat-id-form button');
  const scriptElem = document.getElementById('ZammoBotUIKitScript');
  const zammoApiBaseUrl = window.ZammoBotUIKit.getAttributeOrDefault(scriptElem, 'zammoApiBaseUrl', '');

  if (!zammoApiBaseUrl) {
    showNotification('Make sure you have set the zammoApiBaseUrl attribute in the ZammoBotUIKitScript element');
    return;
  }

  if (webchatIdInputSubmitButton) {
    webchatIdInputSubmitButton.addEventListener('click', handler = async () => {
      const webchatId = webchatIdInput.value;
      let isSimulator = 'false';

      if (webchatId) {
        try {
          // test if we can get the webchat token to validate if the webchat ID is correct.
          await axios.get(`${zammoApiBaseUrl}/api/webchat/token/${webchatId}`);
        } catch {
          try {
            // test if the ID can be used with the simulator token.
            await axios.get(`${zammoApiBaseUrl}/api/simulator/webchat/session?simulatorToken=${webchatId}`);
            isSimulator = 'true';
          } catch {
            // fail if the ID is neither a valid webchat ID or a valid simulator token.
            showNotification('The webchat ID is not valid');
            return;
          }
        }

        hideWebchatIdForm();

        localStorage.setItem(WEBCHAT_ID_LOCAL_STORAGE_KEY, webchatId);
        localStorage.setItem(IS_SIMULATOR_STORAGE_KEY, isSimulator);
        initializeBot(webchatId, isSimulator);

        // reset the form
        // reset the button event listener
        webchatIdInputSubmitButton.removeEventListener('click', handler);
        // reset the webchat ID value
        webchatIdInput.value = '';
      } else {
        showNotification('Please enter a valid webchat id');
      }
    });
  }
}

/**
 * This function is triggered when the popover with the extension is opened.
 * The function manages the stickyness of the chat session.
 */
function initPopUp() {
  const existWebchatId = localStorage.getItem(WEBCHAT_ID_LOCAL_STORAGE_KEY);
  const isSimulator = localStorage.getItem(IS_SIMULATOR_STORAGE_KEY);

  if (existWebchatId) {
    hideWebchatIdForm();
    initializeBot(existWebchatId, isSimulator);
  } else {
    setupWebchatIdHandler();
  }
}

// --------------------------------------------------------------------------------------------------------------------
// Main logic

onDocumentReady(function() {
  // If chrome isn't available then the remainder of the script won't work.
  if (!chrome) {
    const missingChromeErrorMessage = 'This script requires to have permission to assist you, please go to <a href="edge://extensions/">manage extensions</a>.';
    showNotification(missingChromeErrorMessage);
    
  } else if (!axios) {
    showNotification('The script requires the axios library to be installed.');
  } else if (!window.markdownit) {
    showNotification('The script requires the markdown library to be installed.');
  } else {
    ZammoBotUIKit.markdownit = window.markdownit;// custom behavior due to the way the markdown library is loaded..
    initPopUp();
  }
});
