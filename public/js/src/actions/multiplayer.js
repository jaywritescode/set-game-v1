import alt from '../alt';

class MultiplayerActions {
  constructor() {
    this.generateActions(
      'init',
      'changeName',
      'clearName',
      'receiveMessage',
      'startCountdown',
    );
  }

  selectCard(card) {
    return card;
  }

  clearSelected() {
    return true;
  }
}

module.exports = alt.createActions(MultiplayerActions);
