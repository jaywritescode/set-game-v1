const websockets = require('websockets');
const locus = require('locus');
const request = require('request');

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
    client.url('http://localhost:8080')
      .waitForElementPresent('#multiplayer_button')
      .expect.element('#multiplayer_button + ul > *').to.not.be.present;
  },

  'Load home page, one or more games present': function(client) {
    // TODO: implement this somehow
  },

  'Start a new game': function(client) {
    client.click('#multiplayer_button')
      .waitForElementPresent('#multiplayer')
      .expect.element('#multiplayer > ul > *').to.not.be.present;
  },

  'Join an existing game': function(client) {
    // TODO: implement this somehow
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

  'Someone else clicks the "Start" button': function(client) {
    socket.send(JSON.stringify({
      request: 'countdown-start'
    }));
    client.expect.element('button').to.not.be.present.after(100);
    client.expect.element('div.progress').to.be.present.after(100);

    // wait for the game to start
    client.expect.element("div.progress").to.not.be.present.after(10000);
    client.expect.element("div#cards").to.be.present.after(10000);
  },

  'Submit a valid set': function(client) {
    client.perform(function(done) {
      request({
        url: `http://localhost:8080/multiplayer/find?name=${game_name}`,
        json: true,
      }, (error, response, body) => {
        let cards = JSON.parse(body)[0];
        cards.forEach(card => {
          const { number, color, shading, shape } = card;
          const cardSrc = [number, color, shading, shape].join('-');

          client.useXpath()
            .click(`//*[@id="cards"]//div[@class="card"]/img[contains(@src, "${cardSrc}")]`)
            .useCss();
        });
        cards.forEach(card => {
          const { number, color, shading, shape } = card;
          const cardSrc = [number, color, shading, shape].join('-');

          client.useXpath();
          client.expect.element(`//*[@id="cards"]//div[@class="card"]/img[contains(@src, "${cardSrc}")]`)
            .to.not.be.present.after(100);
        });
        client.useCss();
        client.expect.element('li.me').text.to.contain("1 set found so far");
        done();
      });
    });
  },

  'Destroy multiplayer games': function(client) {
    client.end()
  },
};
