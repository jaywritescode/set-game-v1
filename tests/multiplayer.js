module.exports = {
  'Load home page': function(client) {
    client.url('http://localhost:8080?seed=150').pause(1000);
    client.expect.element('#content').to.be.present;
  },

  'No games present': function(client) {
    client
      .waitForElementPresent('#multiplayer_button', 1000)
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
