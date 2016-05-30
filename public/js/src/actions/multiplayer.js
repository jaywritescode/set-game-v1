import alt from '../calt';

class MultiplayerActions {
  updatePlayers(players) {
    console.log('MultiplayerActions.updatePlayers: players = %O', players);
    return players;
  }

  clearName() {
    return true;
  }

  changeName(new_name) {
    return new_name;
  }

  selectCard(card) {
    return card;
  }

  clearSelected() {
    console.log('MultiplayerActions.clearSelected');
    return true;
  }

  receiveMessage(message) {
    console.log('MultiplayerActions.receiveMessage: message = %O', message);
    return message;
  }
}

module.exports = alt.createActions(MultiplayerActions);
