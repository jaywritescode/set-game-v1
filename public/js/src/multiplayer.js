'use strict';

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';

import SetGame from 'setgame';

export default class Multiplayer extends SetGame {
  constructor(props) {
    super(props);
    _.extend(this.state, {
      players: {},
      selected: new Set()
    });
  }

  static get propTypes() {
    return {
      game: React.PropTypes.string.isRequired,
      player_id: React.PropTypes.string
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
          this.setState(_.pick(data, 'players', 'cards'))
          break;
        case 'verify-set':
          console.log(data);
          break;
        default:
          console.warn('Action %s not found.', data.action);
      }
    };
    this.ws.onerror = (event) => {
      console.error(event);
    };
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
                <strong>{player_name}</strong>
                <span>:&nbsp;</span>
                <span>{`${player_found.length} set${player_found.length == 1 ? '' : 's'} found so far`}</span>
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
        <h3>{this.props.name}</h3>
        {this.renderPlayers()}
        {this.renderCards()}
      </div>
    );
  }
}
