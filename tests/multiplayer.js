const websockets = require('websockets');
const locus = require('locus');

function ws_url(game) {
  return `ws://localhost:8080/multiplayer/ws?game=${game}&id=9294c0e2c1232a8503ec1b5dbb49eab111176eaa`
}

var socket,
    game_name;

module.exports = {
  'Clear all games': function(client) {
    client.url('http://localhost:8080/multiplayer/destroy');
  },

  'Load home page, no games present': function(client) {
    client.url('http://localhost:8080?seed=150')
      .waitForElementPresent('#multiplayer_button')
      .expect.element('#multiplayer_button + ul > *').to.not.be.present;
  },

  'Start a new game': function(client) {
    client.click('#multiplayer_button')
      .waitForElementPresent('#multiplayer')
      .expect.element('#multiplayer > ul > *').to.not.be.present;
  },

  "Set the user's name": function(client) {
    client.waitForElementPresent('div.modal[role="dialog"]')
      .setValue('input', 'Brad')
      .click('button');
    client.waitForElementNotPresent('div.modal[role="dialog"]')
      .expect.element('ul li.me').text.to.contain('Brad');
  },

  "Change the user's name": function(client) {
    client.waitForElementNotPresent('div.modal[role="dialog"]')
      .click('ul li.me > strong')
      .waitForElementPresent('div.modal[role="dialog"]')
      .setValue('input', 'Chad')
      .click('button')
      .waitForElementNotPresent('div.modal[role="dialog"]')
      .expect.element('ul li.me').text.to.contain('Chad');
  },

  'Another player joins the game': function(client) {
    client.getText('#left-sidebar > :first-child', function(textResult) {
      game_name = textResult.value;
      socket = new websockets.WebSocket(ws_url(game_name));
      socket.on('open', () => {
        socket.send(JSON.stringify({
          request: 'add-player',
          id: '9294c0e2c1232a8503ec1b5dbb49eab111176eaa',
          new_name: 'Vlad'
        }));
      });
    });
    client.waitForElementPresent('ul li:nth-of-type(2)')
      .expect.element('ul li:nth-of-type(2)').text.to.contain('Vlad');
    client.expect.element('ul li.me:nth-of-type(1)').to.be.present;
    client.expect.element('button').to.be.present;
  },

  "Change the other player's name": function(client) {
    socket.send(JSON.stringify({
      request: 'change-name',
      id: '9294c0e2c1232a8503ec1b5dbb49eab111176eaa',
      new_name: 'Tad'
    }));
    client.expect.element('ul li:nth-of-type(2)').text.to.contain('Tad').before(500);
    client.expect.element('ul li.me:nth-of-type(1)').to.be.present.after(500);
  },

  'Click "Start" button': function(client) {
    // Don't test here. Clicking the start button just sends a websocket
    // message. Test receiving the websocket response here.
  },

  'Destroy multiplayer games': function(client) {
    client.end()
  },
};
