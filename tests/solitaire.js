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
  },

  'Choose three cards that make a set': function(client) {
    client.useXpath();

    client.click('//*[@id="cards"]/ul/li/div/img[contains(@src, "one-blue-striped-squiggles")]');
    client.expect.element('//*[@id="cards"]/ul/li/div/img[contains(@src, "one-blue-striped-squiggles")]/..')
      .to.have.attribute('class').which.contains('selected');

    client.click('//*[@id="cards"]/ul/li/div/img[contains(@src, "two-blue-striped-ovals")]');
    client.expect.element('//*[@id="cards"]/ul/li/div/img[contains(@src, "two-blue-striped-ovals")]/..')
      .to.have.attribute('class').which.contains('selected');

    client
      .click('//*[@id="cards"]/ul/li/div/img[contains(@src, "three-blue-striped-diamonds")]')
      .waitForElementVisible('//*[@id="found-so-far"]/ul[1]', 1000);

    client.expect.element('//*[@id="found-so-far"]/ul[1]/li/div/img[contains(@src, "one-blue-striped-squiggles")]')
      .to.be.visible;
    client.expect.element('//*[@id="found-so-far"]/ul[1]/li/div/img[contains(@src, "two-blue-striped-ovals")]')
      .to.be.visible;
    client.expect.element('//*[@id="found-so-far"]/ul[1]/li/div/img[contains(@src, "three-blue-striped-diamonds")]')
      .to.be.visible;

    client.end();
  }
}
