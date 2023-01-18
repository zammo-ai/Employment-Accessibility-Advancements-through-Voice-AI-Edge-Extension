/**
 * The present script allows the extension to request the Microphone.
 */


function requestMicrophonePermission() {
  var permissionStatus = document.querySelector("#microphone-permission-status");
  if (permissionStatus) {
    permissionStatus.innerHTML = 'on';
  }

  navigator.webkitGetUserMedia({ audio: true }, s => {
    console.log('navigator.webkitGetUserMedia', 'success');
    if (permissionStatus) {
      permissionStatus.innerHTML = 'on';
    }
  }, err => {
    if (permissionStatus) {
      permissionStatus.innerHTML = 'off';
    }
    console.log('navigator.webkitGetUserMedia', 'failure');
  });
}

requestMicrophonePermission();
