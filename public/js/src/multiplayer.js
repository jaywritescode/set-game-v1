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

  render() {
    return (
      <div id="wrapper">
        <h3>{this.props.name}</h3>
        <div id="players">
          <h4>Players</h4>
          {
            [...this.state.players].forEach((player, key) => {
              return (<p>goop</p>);
            })
          }
        </div>
        <div id="cards">
          test
        </div>
      </div>
    );
  }
}
