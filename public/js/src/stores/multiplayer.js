import alt from '../calt';
import _ from 'lodash';
import MultiplayerActions from '../actions/multiplayer';
import SetCard from '../setcard';

class MultiplayerStore {
  constructor() {
    this.my_player_id = undefined;
    this.players = {};
    this.cards = [];
    this.selected = new Set();      // stringify-ed SetCards
    this.current_state = 'WAITING_FOR_PLAYERS';

    this.bindListeners({
      handleUpdatePlayers: MultiplayerActions.UPDATE_PLAYERS,
      handleClearName: MultiplayerActions.CLEAR_NAME,
      handleChangeName: MultiplayerActions.CHANGE_NAME,
      handleReceiveMessage: MultiplayerActions.RECEIVE_MESSAGE,
      handleSelectCard: MultiplayerActions.SELECT_CARD,
      handleClearSelected: MultiplayerActions.CLEAR_SELECTED,
    });
  }

  handleUpdatePlayers(players) {
    console.log('MultiplayerStore.handleUpdatePlayers: players = %O', players);
    this.players = players;
  }

  handleClearName() {
    this.my_player_id = null;
  }

  handleChangeName(new_name) {
    console.log('MultiplayerStore.handleChangeName');
    this.my_player_id = new_name;
  }

  handleSelectCard(card) {
    console.log('MultiplayerStore.handleSelectCard');
    let cardString = SetCard.stringify(card);

    if (this.selected.has(cardString)) {
      this.selected.delete(cardString);
    }
    else {
      this.selected.add(cardString);
    }
  }

  handleClearSelected() {
    console.log('MultiplayerStore.handleClearSelected');
    this.selected.clear();
  }

  handleReceiveMessage(message) {
    console.log('MultiplayerStore.handleReceiveMessage: message = %O', message);

    const
      onAddPlayer = (data) => {
        let { my_player_id, players } = data;
        // TODO: race condition here -- we would like a way to uniquely identify each requester
        if (this.my_player_id === undefined) {
          this.my_player_id = my_player_id;
        }
        this.players = players;
        if (this.current_state == 'WAITING_FOR_PLAYERS' && _.size(this.players) > 1) {
          this.current_state = 'WAITING_FOR_CLICK_START';
        }
        return true;
      },
      onChangeName = (data) => {
        let { old_name, new_name } = data;
        if (!(old_name && new_name)) {
          return false;
        }
        this.players[new_name] = this.players[old_name];
        delete this.players[old_name];
        return true;
      },
      onCountdownStart = () => {
        this.current_state = 'WAITING_FOR_COUNTDOWN';
      },
      onStartGame = (data) => {
        let { cards } = data;
        this.cards = cards;
        this.current_state = 'IN_PROGRESS';
      },
      onVerifySet = (data) => {
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
      };

    let actions = {
      'add-player': onAddPlayer,
      'change-name': onChangeName,
      'countdown-start': onCountdownStart,
      'start-game': onStartGame,
      'verify-set': onVerifySet,
    };

    actions[message.action].call(this, message);
  }
}

module.exports = alt.createStore(MultiplayerStore, 'MultiplayerStore');
