'use strict';

import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';

import SetCard from 'setcard';

const IMG_PATH = 'static/img/';

class Multiplayer extends React.Component {
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
    }
  }

  // FIXME: this shouldn't happen until we have at least two players and
  // then we should also wait and synchronize
  componentWillMount() {
    let onSuccess = function(response) {
      this.setState({
        cards: response.cards,
      });
    }.bind(this);
    let onError = function(response) {
      this.setState({
        error: response
      });
    }.bind(this);
    $.get(this.props.url).then(onSuccess, onError);
  }

  onClickJoinGame() {
    $.ajax(this.props.join_url, {
      method: 'POST'
    }).then((response) => {
      console.log(response);
    });
  }

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

  renderJoinGame() {
    return (
      <div id="join-game">
        <button onClick={this.onClickJoinGame.bind(this)}>Join Game</button>
      </div>
    );
  }

  render() {
    return (
      <div id="wrapper">
        <div id="cards">
          {this.renderCards()}
        </div>
        {this.renderPlayers()}
        {this.renderJoinGame()}
      </div>
    );
  }
}

render(
  <Multiplayer url="/multiplayer/game" join_url="/multiplayer/join"/>, document.getElementById('multiplayer')
);
