'use strict';

import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';

import SetCard from 'setcard';

const IMG_PATH = 'static/img/';

export default class Multiplayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      selected: new Set(),
      players: new Map()
    };
    this.ws = new WebSocket(`ws://localhost:8080/${this.props.url}`);
    this.ws.onopen = (event) => {
      console.log('websocket is open');
      this.ws.send('some message');
    }
    this.ws.onmessage = (event) => {
      console.log('received a message: %O', event);
      console.log(event.data);
    }
  }

  // FIXME: this shouldn't happen until we have at least two players and
  // then we should also wait and synchronize
//  componentWillMount() {
//    let onSuccess = function(response) {
//      this.setState({
//        cards: response.cards,
//      });
//    }.bind(this);
//    let onError = function(response) {
//      this.setState({
//        error: response
//      });
//    }.bind(this);
//    $.get(this.props.url).then(onSuccess, onError);
//  }

  renderCards() {
    if (this.state.players.size < 2) {
      return (<p>Waiting for players...</p>);
    }
    else {
      return (
        <ul>
          {this.state.cards.map((card) => {
            return (
              <li>
                <SetCard card={card} />
              </li>
            );
          })}
        </ul>
      );
    }
  }

  renderPlayers() {
    return (
      <div id="players">
        <h4>Players</h4>
        {
          [...this.state.players].forEach((player, key) => {
            return (<p>goop</p>);
          })
        }
      </div>
    );
  }

  render() {
    console.log('Multiplayer.render');
    return (
      <div id="wrapper">
        <h3>{this.props.name}</h3>
        <div id="cards">
          {this.renderCards()}
        </div>
        {this.renderPlayers()}
      </div>
    );
  }
}
