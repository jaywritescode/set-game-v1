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
      players: {}
    };
  }

  componentWillMount() {
    this.ws = new WebSocket(`ws://localhost:8080/${this.props.url}/ws`);
    this.ws.onopen = (event) => {
      $.get(this.props.url);
    };
    this.ws.onmessage = (event) => {
      let data = JSON.parse(event.data);
      this.setState({
        players: data.players,
        cards: data.cards || {}
      });
    };
  }

  renderPlayers() {
    $.map(this.state.players, function(value, key) { console.log(value); });
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
        <div id="cards">
          test
        </div>
      </div>
    );
  }
}
