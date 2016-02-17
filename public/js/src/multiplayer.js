'use strict';

import $ from 'jquery';
import React from 'react';

import SetGame from 'setgame';

const HEARTBEAT = '--heartbeat--'
var heartbeat_interval = null;
var missed_heartbeats = 0;

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
      name: React.PropTypes.string.isRequired,
      player_id: React.PropTypes.string
    };
  }

  componentWillMount() {
    // query for the players in this game
    $.getJSON(`${this.props.url}/players`, {name: this.props.name}).then(
      (response) => {
        // response => [{name: 'P1', found: [...]}, {name: 'P2', found: [...]}]
        this.setState({
          players: JSON.parse(response)
        });
      }, (response) => console.error(response)
    );

    this.ws = new WebSocket(`ws://localhost:8080/${this.props.url}/ws?game=${this.props.name}`);
    this.ws.onopen = (event) => {
      console.log('opened: %O', event);
    };
    this.ws.onmessage = (event) => {
      console.log('message: %O', event);
      let data = JSON.parse(event.data);
      if (data.action == 'add-player') {
        this.onWSPlayerAdded(data.name);
      }
      else {
        console.warn('action not found');
      }
    };
    this.ws.onerror = (event) => {
      console.error('error: %O', event);
    };
    window.ws = this.ws;
  }

  onWSPlayerAdded(name) {
    this.setState({
      players: this.state.players.concat({name: name, found: []})
    });
  }

  onClickSetCard(card, cardState) {
    if (cardState.selected) {
      this.state.selected.add(card);
    }
    else {
      this.state.selected.delete(card);
    }

    if (this.state.selected.size == 3) {
      let msg = $.extend(this.props, {
        cards: [...this.state.selected].map((component) => {
          return component.props.card;
        }),
        action: 'submit-set'
      });

      this.ws.send(JSON.stringify(msg));
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
          $.map(this.state.players, (value) => {
            return (
              <li key={value.name}>
                <span>Player&nbsp;</span>
                <strong>{value.name}</strong>
                <span>:&nbsp;</span>
                <span>{`${value.found.length} set${value.found.length == 1 ? '' : 's'} found so far`}</span>
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
