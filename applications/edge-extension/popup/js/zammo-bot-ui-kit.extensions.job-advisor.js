/**
 * Defines and add a Zammo Bot UI Kit extension to manage the interactions within the popup
 * @requires axios
 * @requires ZammoBotUIKit
 */

/**
 * This Zammo Bot UI Kit supports custom actions for the edge extension.
 * @returns object containing {canHandleInbound, handleInbound, canHandleOutbound, handleOutbound}
 */
var JobAdvisorExtension = function () {
  const constants = {
    GET_PAGE_CONTENT_ACTIVITY_TYPE: 'zammo-get-page-content',
    PAGE_CONTENT_REPORTING_ACTIVITY_NAME: 'zammo-page-content-reporting',
    GET_PAGE_CONTENT_ACTIVITY_LOCAL_STORAGE_KEY: 'zammo-get-page-content-activity-key',
  };

  var extension = this;

  /**
   * 
   * @param {BotFrameworkActivity} activity a JSON object representing an activity sent from or to the bot.
   * @param {ZammoBotUIKit} zammoBotUiInstance the local instance of the Zammo Bot UI Kit.
   * @returns {boolean} true or false if the currect activity is a get page content
   */
  extension.isGetPageContentActivity = function (activity, zammoBotUiInstance) {
    return activity.type === constants.GET_PAGE_CONTENT_ACTIVITY_TYPE && activity.from && activity.from.id !== zammoBotUiInstance.user.id;
  }

  /**
   * Check in the local storage if the current activity has already been handled.
   * @param {BotFrameworkActivity} activity a JSON object representing an activity sent from or to the bot.
   */
  extension.isAnActivityAlreadyProcessed = function (activity) {
    const processedGetPageContentActivitiesAsString = localStorage.getItem(constants.GET_PAGE_CONTENT_ACTIVITY_LOCAL_STORAGE_KEY);
    const processedGetPageContentActivities = processedGetPageContentActivitiesAsString ? JSON.parse(processedGetPageContentActivitiesAsString) : [];

    return processedGetPageContentActivities.includes(activity.id);
  }

  /**
   * Add the activity to the processed activity in the local storage.
   * @param {BotFrameworkActivity} activity a JSON object representing an activity sent from or to the bot.
   */
  extension.addActivityToProcessedActivities = function (activity) {
    const processedGetPageContentActivitiesAsString = localStorage.getItem(constants.GET_PAGE_CONTENT_ACTIVITY_LOCAL_STORAGE_KEY);
    const processedGetPageContentActivities = processedGetPageContentActivitiesAsString ? JSON.parse(processedGetPageContentActivitiesAsString) : [];

    processedGetPageContentActivities.push(activity.id);

    localStorage.setItem(constants.GET_PAGE_CONTENT_ACTIVITY_LOCAL_STORAGE_KEY, JSON.stringify(processedGetPageContentActivities));
  }

  extension.canHandleRequiredStylesAndScriptsLoading = function (zammoBotUiInstance, logger) {
    return true;
  }

  extension.handleRequiredStylesAndScriptsLoading = function (zammoBotUiInstance, logger, cb) {
    cb();
  }

  extension.canHandleInbound = function (activity, zammoBotUiInstance) {
    const canExtensionHandleInbound = extension.isGetPageContentActivity(activity, zammoBotUiInstance);

    return canExtensionHandleInbound;
  };

  extension.canHandleOutbound = function (activity, zammoBotUIInstance) {
    return false;
  };

  extension.handleOutbound = function (activity, zammoBotUiInstance, logger) {
  };

  extension.handleInbound = async function (activity, zammoBotUiInstance, logger) {
    if (!extension.isGetPageContentActivity(activity, zammoBotUiInstance)) {
      // this should not happen since the function is only trigger if the condition is met inside canHandleInbound.
      console.error('handleInbound', 'non get page content activity attempting to be processed by extension', activity);
      return;
    }

    if (extension.isAnActivityAlreadyProcessed(activity)) {
      // activity has already been processed. this case occurs because of the sticky chat replaying all the activities.
      return;
    }

    extension.addActivityToProcessedActivities(activity);

    const queryOptions = { active: true, currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    const [tab] = await chrome.tabs.query(queryOptions);
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTENT' }, function(tabResponse) {

        if (!tabResponse.error) {
          const requestData = {
              pageContent: tabResponse.pageContent
          };

          if (activity.value) { // value contains the proactive URL.
            axios.post(activity.value, requestData, {});
          }

        } else {
          console.error('reviewJobPosting', 'error from the content script', tabResponse.error);
        }
      });
    }
  };

  return extension;
};

// register extensions
if (window.ZammoBotUIKit) {
  window.ZammoBotUIKit.onDocumentReady(function() {
    if (chrome) {
      window.ZammoBotUIKit.Extensions.push(new JobAdvisorExtension());
    } else {
      console.error('ZammoBotUIKit', 'extension', 'the chrome context is not available, this extension will not be loaded.');
    }
  });
} else {
  console.error('ZammoBotUIKit', 'extension', 'the ZammoBotUIKit is not available in the context, this extension will not be loaded.');
}
