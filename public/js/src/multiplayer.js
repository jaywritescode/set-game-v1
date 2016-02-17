'use strict';

import $ from 'jquery';
import React from 'react';

import SetGame from 'setgame';

export default class Multiplayer extends SetGame {
  constructor(props) {
    super(props);
    $.extend(this.state, {
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
          this.onWSPlayerAdded(data.players);
          break;
        default:
          console.warn('Action %s not found.', data.action);
      }
    };
    this.ws.onerror = (event) => {
      console.error(event);
    };
    window.ws = this.ws;
  }

  onWSPlayerAdded(players) {
    this.setState({
      players: players
    });
  }

  renderPlayers() {
    return (
      <ul id="players">
        <h4>Players</h4>
        {
          $.map(Object.keys(this.state.players), (key) => {
            let player_name = key, player_found = this.state.players[key];
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
