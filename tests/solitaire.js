const game = [
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
];

const cards_xpath = (card) => {
  return `//*[@id="cards"]/ul/li/div/img[contains(@src, "${card}")]`;
};
const found_xpath = (card) => {
  return `//*[@id="found-so-far"]/ul[1]/li/div/img[contains(@src, "${card}")]`;
};

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

    game.forEach((cardStr) => {
      client.expect.element(`.card img[src*=${cardStr}]`).to.be.present;
    });
  },

  'Choose three cards that make a set': function(client) {
    const setStr = [
      'one-blue-striped-squiggles',
      'two-blue-striped-ovals',
      'three-blue-striped-diamonds'
    ];

    let cardStr;
    client.useXpath();

    cardStr = setStr[0];
    client.click(cards_xpath(cardStr));
    client.expect.element(`${cards_xpath(cardStr)}/..`).to.have.attribute('class').that.contains('selected');

    cardStr = setStr[1];
    client.click(cards_xpath(cardStr));
    client.expect.element(`${cards_xpath(cardStr)}/..`).to.have.attribute('class').that.contains('selected');

    client
      .click(cards_xpath(setStr[2]))
      .waitForElementVisible('//*[@id="found-so-far"]/ul[1]', 1000);

    setStr.forEach((str) => {
      client.expect.element(found_xpath(str)).to.be.visible;
      client.expect.element(`${cards_xpath(str)}/..`).to.have.attribute('class').that.does.not.contain('selected');
    });
  },

  "Select and then de-select a card": function(client) {
    const element_xpath = '//*[@id="cards"]/ul/li[1]/div';

    client.click(element_xpath);
    client.expect.element(element_xpath).to.have.attribute('class').that.contains('selected');

    client.click(element_xpath);
    client.expect.element(element_xpath).to.have.attribute('class').that.does.not.contain('selected');
  },

  "Choose three cards that don't make a set": function(client) {
    const setStr = [
      'two-red-solid-squiggles',
      'two-blue-striped-ovals',
      'three-blue-striped-diamonds'
    ];

    setStr.forEach((str) => {
      client.click(cards_xpath(str));
    });

    client.pause(1000);

    client.expect.element('//*[@id=found-so-far]/ul[2]').to.not.be.present;

    setStr.forEach((str) => {
      client.click(cards_xpath(str));
    });
  },

  "Choose a set that's already been found": function(client) {
    [
      'one-blue-striped-squiggles',
      'two-blue-striped-ovals',
      'three-blue-striped-diamonds'
    ].forEach((str) => {
      client.click(cards_xpath(str));
    });

    client.pause(1000);

    client.expect.element('//*[@id=found-so-far]/ul[2]').to.not.be.present;
  },

  "Finish the game": function(client) {
    const sets = [
      ['one-red-solid-diamonds', 'two-red-solid-squiggles', 'three-red-solid-ovals'],
      ['three-green-solid-squiggles', 'three-blue-solid-diamonds', 'three-red-solid-ovals'],
      ['three-red-solid-ovals', 'two-green-solid-squiggles', 'one-blue-solid-diamonds'],
      ['one-red-solid-diamonds', 'two-blue-solid-ovals', 'three-green-solid-squiggles'],
      ['one-blue-solid-diamonds', 'two-blue-solid-ovals', 'three-blue-solid-squiggles'],
    ];

    sets.forEach((set) => {
      set.forEach((str) => {
        client.click(cards_xpath(str));
      });
      client.pause(50);
    });

    client.useCss();
    client.expect.element('[role="dialog"]').to.be.present;
    client.click('.modal-dialog button');
    client.expect.element('[role="dialog"]').to.not.be.present.after(1000);
    client.expect.element('#found-so-far ul').to.not.be.present;

    client.end();
  },
};
