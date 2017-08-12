import alt from '../alt';

class MultiplayerActions {
  constructor() {
    this.generateActions(
      'init',
      'changeName',
      'clearName',
      'receiveMessage',
      'startCountdown',
      'selectCard',
    );
  }

  clearSelected() {
    return true;
  }
}

module.exports = alt.createActions(MultiplayerActions);
