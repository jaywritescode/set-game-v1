module.exports = {
  'Load home page': function(client) {
    client.url('http://localhost:8080?seed=150').pause(1000);
    client.expect.element('#content').to.be.present;
  },

  'Start solitaire': function(client) {
    client
      .waitForElementVisible('#solitaire_button', 1000)
      .click('#solitaire_button');
    client.expect.element('#cards').to.be.present.after(1000);
    client.expect.element('#found-so-far').to.be.present;

    [
      'one-blue-solid-diamonds',
      'three-blue-solid-diamonds',
      'one-blue-striped-squiggles',
      'two-blue-striped-ovals',
      'one-red-solid-diamonds',
      'three-green-solid-squiggles',
      'three-red-solid-ovals',
      'three-blue-solid-squiggles',
      'two-green-solid-squiggles',
      'three-blue-striped-diamonds',
      'two-red-solid-squiggles',
      'two-blue-solid-ovals'
    ].forEach((str) => {
      client.expect.element(`.card img[src*=${str}]`).to.be.present;
    });
    client.end();
  }
}
