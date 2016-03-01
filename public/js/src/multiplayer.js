'use strict';

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import { Modal, Input, Button } from 'react-bootstrap';

import SetGame from 'setgame';

export default class Multiplayer extends SetGame {
  constructor(props) {
    super(props);
    _.extend(this.state, {
      players: {},
      selected: new Set(),
      game_over: false
    });

    window.onbeforeunload = function(evt) { 
      $.get('multiplayer/leave');
    };
    _.bindAll(this, 'onChangeName');
  }

  static get propTypes() {
    return {
      game: React.PropTypes.string.isRequired
    };
  }

  componentWillMount() {
    // create the websocket
    this.ws = new WebSocket(`ws://localhost:8080/${this.props.url}/ws?game=${this.props.game}`);
    this.ws.onopen = (event) => {
      console.log('Websocket opened: %O', event);

      // add this (unnamed) player to the game
      this.ws.send(JSON.stringify({request: 'add-player'}));
    };
    this.ws.onmessage = (event) => {
      console.log('Message received: %O', event);

      let data = JSON.parse(event.data);
      switch(data.action) {
        case 'add-player':
          this.setState(_.pick(data, 'my_player_id', 'players', 'cards'))
          break;
        case 'verify-set':
          if (!data.valid) {
            return;
          }
          const {
            cards,
            players
          } = this.state;

          data.cards_to_remove.forEach((c) => {
            cards[_.findIndex(cards, _.matches(c))] = data.cards_to_add.pop();
          });
          while (data.cards_to_add.length) {
            cards.push(data.cards_to_add.pop());
          }

          players[data.player] = data.found;
          this.setState({
            cards: cards,
            players: players,
            game_over: !!data.game_over
          });
          break;
        case 'change-name':
          if (data.old_name && data.new_name) {
            this.state.players[data.new_name] = this.state.players[data.old_name];
            delete this.state.players[data.old_name];
            this.setState({
              my_player_id: data.new_name,
              players: this.state.players
            });
          }
          break;
        default:
          console.warn('Action %s not found.', data.action);
      }
    };
    this.ws.onerror = (event) => {
      console.error(event);
    };
  }

  onChangeName(evt) {
    console.log(evt);

    let name_input = $('input#your_name'), name = name_input.val();
    if (name) {
      this.ws.send(JSON.stringify({
        request: 'change-name',
        new_name: name
      }));
    }
    else {
      this.setState({
        my_player_id: null
      });
    }
  }

  onClickSetCard(card, cardState) {
    console.log('onClickSetCard card: %O, cardState: %O', card, cardState);

    if (cardState.selected) {
      this.state.selected.add(card);
    }
    else {
      this.state.selected.delete(card);
    }

    if (this.state.selected.size == 3) {
      this.ws.send(JSON.stringify({
        request: 'verify-set',
        cards: [...this.state.selected].map((component) => {
          return component.props.card;
        }),
      }));
      for (card of this.state.selected) {
        card.setState({
          selected: false
        });
      }
      this.state.selected.clear();
    }
  }

  renderPlayers() {
    return (
      <ul id="players">
        <h4>Players</h4>
        {
          _.map(this.state.players, (value, key) => {
            let player_name = key, player_found = value;
            return (
              <li key={player_name}>
                <span>Player&nbsp;</span>
                <strong onClick={key == this.state.my_player_id ? this.onChangeName : _.noop}>{player_name}</strong>
                <span>:&nbsp;</span>
                <span>{`${player_found} set${player_found == 1 ? '' : 's'} found so far`}</span>
              </li>
            );
          })
        }
      </ul>
    );
  }

  render() {
    return (
      <div id="wrapper">
        <Modal show={this.state.my_player_id === null}>
          <Modal.Body>
            <Input id="your_name" type="text" label="Your name..." placeholder="Enter text" />
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.onChangeName}>{"That's Me!"}</Button>
          </Modal.Footer>
        </Modal>
        <h3>{this.props.name}</h3>
        {this.renderPlayers()}
        {this.renderCards()}
      </div>
    );
  }
}
