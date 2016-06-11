require('babel-register')();

var jsdom = require('jsdom').jsdom;

var exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
global.window.WebSocket = function() {
  return {
    send: function() {}
  }
};
global.XMLHttpRequest = global.window.XMLHttpRequest;

global.sinon = require('sinon');
global.sinon.useFakeXMLHttpRequest();
global.window.XMLHttpRequest = global.XMLHttpRequest;

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

documentRef = document;
