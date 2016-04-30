import alt from './calt';

class MultiplayerActions {
  updatePlayers(players) {
    console.log('MultiplayerActions.updatePlayers: players = %O', players);
    return players;
  }

  clearName() {
    console.log('MultiplayerActions.clearName');
    return true;
  }

  receiveMessage(message) {
    console.log('MultiplayerActions.receiveMessage: message = %O', message);
    return message;
  }
}

module.exports = alt.createActions(MultiplayerActions);
