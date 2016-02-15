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
      players: {}
    });
  }

  static get propTypes() {
    return {
      name: React.PropTypes.string.isRequired,
      player_id: React.PropTypes.string
    };
  }

  componentWillMount() {
    this.ws = new WebSocket(`ws://localhost:8080/${this.props.url}/ws`);
    this.ws.onopen = (event) => {
      console.log('opened: %O', event);
    }
    this.ws.onerror = (event) => {
      console.error('error: %O', event);
    };
    window.ws = this.ws;
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
          $.map(this.state.players, (value, key) => {
            return (
              <li key={key}>
                <span>Player&nbsp;</span>
                <strong>{key}</strong>
                <span>:&nbsp;</span>
                <span>{`${value.length} set${value.length == 1 ? '' : 's'} found so far`}</span>
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
