import alt from '../alt';

class MultiplayerActions {
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
    return true;
  }

  receiveMessage(message) {
    return message;
  }
}

module.exports = alt.createActions(MultiplayerActions);
