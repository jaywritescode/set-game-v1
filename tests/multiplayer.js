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
    client.waitForElementNotPresent('div[role="dialog"]')
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

  'Destroy multiplayer games': function(client) {
    client.end()
  },
};
