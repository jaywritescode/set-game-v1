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

  changeName(new_name) {
    console.log('MultiplayerActions.changeName');
    return new_name;
  }

  receiveMessage(message) {
    console.log('MultiplayerActions.receiveMessage: message = %O', message);
    return message;
  }
}

module.exports = alt.createActions(MultiplayerActions);
