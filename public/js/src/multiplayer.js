'use strict';

import $ from 'jquery';
import React from 'react';

import SetGame from 'setgame';

export default class Multiplayer extends SetGame {
  constructor(props) {
    super(props);
    $.extend(this.state, {
      players: {}
    });
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

  onClickSetCard(card, cardState) {
    if (cardState.selected) {
      this.state.selected.add(card);
    }
    else {
      this.state.selected.delete(card);
    }

    if (this.state.selected.size == 3) {
      $.ajax(this.props.url, {
        data: {
          cards: JSON.stringify([...this.state.selected].map(function(component) {
            return component.props.card;
          }))
        },
        method: 'PUT',
        contextType: 'application/json'
      }).then(() => {
        for (card of this.state.selected) {
          card.setState({
            selected: false
          });
        }
        this.state.selected.clear();
      }, (response) => {
        console.error(response)
      });
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
