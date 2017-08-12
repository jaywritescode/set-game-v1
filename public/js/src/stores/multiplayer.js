import alt from '../alt';
import _ from 'lodash';
import MultiplayerActions from '../actions/multiplayer';
import SetCard from '../setcard';

class MultiplayerStore {
  constructor() {
    this.name = null;
    this.players = {};
    this.cards = [];
    this.selected = new Set();      // stringify-ed SetCards
    this.current_state = 'WAITING_FOR_PLAYERS';
    this.id = null;
    this.websocket = null;

    this.bindListeners({
      handleInit: MultiplayerActions.INIT,
      handleChangeName: MultiplayerActions.CHANGE_NAME,
      handleClearName: MultiplayerActions.CLEAR_NAME,
      handleReceiveMessage: MultiplayerActions.RECEIVE_MESSAGE,
      handleSelectCard: MultiplayerActions.SELECT_CARD,
      handleStartCountdown: MultiplayerActions.START_COUNTDOWN,
    });
  }

  handleInit(data) {
    const { protocol, host, url, game, id } = data;

    this.id = id;
    this.websocket = new WebSocket(`${protocol == 'https:' ? 'wss:' : 'ws:'}//${host}/${url}/ws?game=${game}&id=${id}`);

    this.websocket.onopen = _.noop;
    this.websocket.onmessage = (event) => {
      MultiplayerActions.receiveMessage(JSON.parse(event.data));
    };
    this.websocket.onerror = (event) => {
      console.error('An error occurred: %O', event);
    };
    this.websocket.onclose = (event) => {
      console.log('websocket closed');
    };
  }

  handleClearName() {
    this.name = '';     // falsy, non-null value so we pass a "change-name" method over the websocket
  }

  /**
   * @param {string} data - this player's new name
   */
  handleChangeName(data) {
    this.websocket.send(JSON.stringify({
      request: this.name === null ? 'add-player' : 'change-name',
      id: this.id,
      new_name: data
    }));
  }

  handleStartCountdown() {
    this.websocket.send(JSON.stringify({
      request: 'countdown-start'
    }));
  }

  handleSelectCard(card) {
    let cardString = SetCard.stringify(card);

    if (this.selected.has(cardString)) {
      this.selected.delete(cardString);
    }
    else {
      this.selected.add(cardString);
      if (this.selected.size == 3) {
        this._submit();
      }
    }
  }

  handleReceiveMessage(message) {
    console.log('MultiplayerStore.handleReceiveMessage: message = %O', message);
    const { request } = message;
    const actions = {
      'add-player': this.onAddPlayer,
      'change-name': this.onChangeName,
      'countdown-start': this.onCountdownStart,
      'start-game': this.onStartGame,
      'verify-set': this.onVerifySet,
    };

    if (actions[request]) {
      actions[request].call(this, message);
    }
  }

  // websocket response handlers
  onAddPlayer(data) {
    this._updatePlayers(data);

    if (this.current_state == 'WAITING_FOR_PLAYERS' && _(this.players).size() > 1) {
      this.current_state = 'WAITING_FOR_CLICK_START';
    }
  }

  onChangeName(data) {
    this._updatePlayers(data);
  }

  onCountdownStart(data) {
    if (this.current_state == 'WAITING_FOR_CLICK_START') {
      this.current_state = 'WAITING_FOR_COUNTDOWN';
    }
  }

  onStartGame(data) {
    if (this.current_state == 'WAITING_FOR_COUNTDOWN') {
      const { cards } = data;
      this.cards = cards;
      this.selected = new Set();
      this.current_state = 'IN_PROGRESS';
    }
  }

  onVerifySet(data) {
    let { valid, cards_to_add, cards_to_remove, player, found, game_over} = data;
    if (!valid) {
      return false;
    }
    cards_to_remove.forEach((c) => {
      this.selected.delete(SetCard.stringify(c));
      this.cards[_.findIndex(this.cards, _.matches(c))] = cards_to_add.pop();
    });
    while (cards_to_add.length) {
      this.cards.push(cards_to_add.pop());
    }

    this.players[player] = found;
  }

  _submit() {
    this.websocket.send(JSON.stringify({
      request: 'verify-set',
      id: this.id,
      cards: [...this.selected].map((string) => {
        let [number, color, shading, shape] = string.split(' ');
        return { number, color, shading, shape};
      })
    }));
  }

  _updatePlayers(data) {
    const { name, players, id } = data;
    if (id == this.id) {
      this.name = name;
    }
    this.players = players;
  }
}

module.exports = alt.createStore(MultiplayerStore, 'MultiplayerStore');
