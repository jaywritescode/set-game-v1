import alt from '../alt';

class MultiplayerActions {
  constructor() {
    this.generateActions('changeName')
  }

  clearName() {
    return true;
  }

  selectCard(card) {
    return card;
  }

  clearSelected() {
    return true;
  }

  receiveMessage(message) {
    return message;
  }
}

module.exports = alt.createActions(MultiplayerActions);
