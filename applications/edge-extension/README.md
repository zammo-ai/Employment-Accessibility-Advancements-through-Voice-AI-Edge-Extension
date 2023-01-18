# Edge extension prototype for Employment Accessibility Advancements through Voice AI

## About

This folder contains the source for the Edge extension used in the project Employment Accessibility Advancements through Voice AI.

For more information on the overall project please visit [this page](../../README.md)

## Documentation

### **Requirements**

In order to run this extension you will need:

- The [Microsoft Edge browser](https://www.microsoft.com/en-us/edge)

You will also need to complete the setup of the Zammo chatbot as described in [this documentation](../../README.md#creation_of_a_zammo_bot)

### **Setup**

After you have completed installing the browser and creating the bot in Zammo, open your Microsoft Edge Browser.

Inside your Microsoft Edge Browser:

1.  Go to the "manage extensions" section of the browser.

<img src="https://user-images.githubusercontent.com/86251823/213250477-dfe64821-a118-4c5d-852d-359d1abae335.png" alt="Navigate To Manage Extensions" width="400" height="600">

2.  Turn on the `Developer` mode and use point to this folder of the repository.

<img src="https://user-images.githubusercontent.com/86251823/213250591-bc44b1a7-63d2-4c73-9257-739536929a1e.png" alt="Turn on Developer Mode and Load Extension Code" width="1000" height="400">

3.  Direct to the Repository Folder and load the application inside your browser.

<img src="https://user-images.githubusercontent.com/86251823/213250930-17f26a72-7ee1-4336-94db-f2738be3ccfd.png" alt="Direct to Repository Folder" width="800" height="400">

### **Usage**

When using the chatbot, it will request an ID: Use the ID from the chatbot snippet on Zammo as described in [this documentation](../../README.md#creation_of_a_zammo_bot)

<img src="https://user-images.githubusercontent.com/86251823/213250444-7ca001f1-eb11-4f9f-a9d2-f857815bda79.png" alt="Load Extension and Provide Webchat ID or Simulator Token from Your Zammo Bot" width="400" height="600">

Once you enter the ID the bot should guide you through the journey.

The extension helps the bot read the page you are currently viewing, which allows you then to ask any question about the page to the bot.

### **Architecture**

[This document](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/) provides an in-depth description of the extension structure.

In this extension, we use the content script (which runs on the page) to read the page content and then send it to the bot for processing.

## Functionality

### **Development status**

This project was an exploration to the possibilities of helping Employment become more accessible.

The Zammo team will not continue the development of the extension but is happy to share the work that has been done so far.

We are adding in the section below some of the work that we would have done to get the extension from this alpha state to a beta state.

Our notes below are by no means a roadmap and would require, as we've done as part of the project, a few rounds of testing to ensure it meets the users' needs.

### **Features we would build**

If we wanted to continue the work on the extension, here are a few areas we would focus on:

1. Make the chatbot part of the content page

> Having to click on the browser extension icon to view the chatbot is both a challenging UX and not the most accessible.
>
> In an iteration, we would update the content script to load the chatbot inside the visited page or domain of a company's site.
>
> It would allow the user to have it open at all times and improve the interactions.

###### _Some of the risks we noted about adding this capability_

> Some websites don't meet the accessibility criteria. Adding the chatbot to it can expose the user to challenges since the website might prevent them from ever getting to the chatbot in the first place.

2. Add the chatbot in a standalone tab

> Edge extensions allow builders to control multiple tabs (if the end-user authorizes it.)
>
> One functionality we were contemplating was to add the chatbot in a standalone tab, which could allow the user to have multiple tabs open.
>
> It would make the chatbot easily accessible and also prevent any issues with websites that don’t meet accessibility criteria.

###### _Some of the risks we noted about adding this capability_

> Some users might have challenges navigating between the windows.

## Contribution

### **How to contribute**

We will not actively maintain the repository. If you’re interested in owning the maintenance or actively contributing, we can suggest the following:

- Fork this repository
- Get in touch with us at support@zammo.ai, if you tell us your plan, we might be able to help.
