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
      .waitForElementPresent('#cards')
      .expect.element('#cards > ul > *').to.not.be.present;
  },

  'Destroy multiplayer games': function(client) {
    client.end()
  },
};
