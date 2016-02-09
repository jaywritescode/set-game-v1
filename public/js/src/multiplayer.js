'use strict';

import $ from 'jquery';
import React from 'react';

import SetGame from 'setgame';

const HEARTBEAT = '--heartbeat--';
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
      if (this.ws.bufferedAmount === 0) {
        this.ws.send('opening');
      }


      // let msg = {
      //   action: 'player-add',
      //   game: this.props.name
      // };
      // this.ws.send(JSON.stringify(msg));

      if (heartbeat_interval === null) {
        missed_heartbeats = 0;
        heartbeat_interval = setInterval(() => {
          try {
            missed_heartbeats++;
            if (missed_heartbeats >= 3) {
              throw new Error("Too many missed heartbeats.");
            }
            this.ws.send(HEARTBEAT);
          }
          catch(e) {
            clearInterval(heartbeat_interval);
            heartbeat_interval == null;
            console.warn("Closing connection. Reason: %s", e.message);
            // this.ws.close();
          }
        }, 5000);
      }


    };
    this.ws.onmessage = (event) => {
      console.log(event);

      if (event.data === HEARTBEAT) {
        console.log('heartbeat received');
        missed_heartbeats = 0;
        return;
      }
    };
    // this.ws.onmessage = (event) => {
    //   let data = JSON.parse(event.data);
    //   this.setState({
    //     players: data.players,
    //     cards: data.cards || {}
    //   });
    // };
    this.ws.onclose = (event) => {
      console.log('websocket closed: %O', event);
    };
    this.ws.onerror = (event) => {
      console.error('error: %O', event);
    }
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
