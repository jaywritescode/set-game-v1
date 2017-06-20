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
    const one = 'one-blue-striped-squiggles',
          two = 'two-blue-striped-ovals',
          three = 'three-blue-striped-diamonds';
    let cards_xpath = (card) => {
      return `//*[@id="cards"]/ul/li/div/img[contains(@src, "${card}")]`;
    };
    let found_xpath = (card) => {
      return `//*[@id="found-so-far"]/ul[1]/li/div/img[contains(@src, "${card}")]`;
    };

    client.useXpath();

    client.click(cards_xpath(one));
    client.expect.element(`${cards_xpath(one)}/..`).to.have.attribute('class').that.contains('selected');

    client.click(cards_xpath(two));
    client.expect.element(`${cards_xpath(two)}/..`).to.have.attribute('class').that.contains('selected');

    client
      .click(cards_xpath(three))
      .waitForElementVisible('//*[@id="found-so-far"]/ul[1]', 1000);

    client.expect.element(found_xpath(one)).to.be.visible;
    client.expect.element(found_xpath(two)).to.be.visible;
    client.expect.element(found_xpath(three)).to.be.visible;

    client.expect.element(`${cards_xpath(one)}/..`).to.have.attribute('class')
      .that.does.not.contain('selected');
    client.expect.element(`${cards_xpath(two)}/..`).to.have.attribute('class')
      .that.does.not.contain('selected');
    client.expect.element(`${cards_xpath(three)}/..`).to.have.attribute('class')
      .that.does.not.contain('selected');
  },

  "Select and then de-select a card": function(client) {
    const element_xpath = '//*[@id="cards"]/ul/li[1]/div';

    client.click(element_xpath);
    client.expect.element(element_xpath).to.have.attribute('class').that.contains('selected');

    client.click(element_xpath);
    client.expect.element(element_xpath).to.have.attribute('class').that.does.not.contain('selected');
  },

  "Choose three cards that don't make a set": function(client) {
    const one = 'two-red-solid-squiggles',
          two = 'two-blue-striped-ovals',
          three = 'three-blue-striped-diamonds';
    let cards_xpath = (card) => {
      return `//*[@id="cards"]/ul/li/div/img[contains(@src, "${card}")]`;
    };

    client.click(cards_xpath(one));
    client.click(cards_xpath(two));
    client.click(cards_xpath(three));
    client.pause(1000);

    client.expect.element('//*[@id=found-so-far]/ul[2]').to.not.be.present;

    client.click(cards_xpath(one));
    client.click(cards_xpath(two));
    client.click(cards_xpath(three));
  },

  "Choose a set that's already been found": function(client) {
    const one = 'one-blue-striped-squiggles',
          two = 'two-blue-striped-ovals',
          three = 'three-blue-striped-diamonds';
    let cards_xpath = (card) => {
      return `//*[@id="cards"]/ul/li/div/img[contains(@src, "${card}")]`;
    };

    client.click(cards_xpath(one));
    client.click(cards_xpath(two));
    client.click(cards_xpath(three));
    client.pause(1000);

    client.expect.element('//*[@id=found-so-far]/ul[2]').to.not.be.present;

    client.click(cards_xpath(one));
    client.click(cards_xpath(two));
    client.click(cards_xpath(three));
  },

  "Finish the game": function(client) {
    client.end();
  },
}
