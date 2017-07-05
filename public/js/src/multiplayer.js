'use strict';

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, FormGroup, ControlLabel, FormControl, Button, ProgressBar } from 'react-bootstrap';
import MultiplayerStore from './stores/multiplayer';
import MultiplayerActions from './actions/multiplayer';

import SetGame from './setgame';

export default class Multiplayer extends SetGame {
  constructor(props) {
    super(props);
    window.onbeforeunload = function(evt) {
      this.ws.close();
      $.get('multiplayer/leave');
    };
    this.state = {};
    _.bindAll(this, 'onChange', 'onChangeName', 'onClickSetCard', 'onCountdownStart'/*, 'onNameInputChange'*/);
  }

  static get propTypes() {
    return {
      game: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired,
      id: React.PropTypes.string.isRequired,
    };
  }

  componentWillMount() {
    // create the websocket
    this.ws = new WebSocket(`${window.location.protocol == 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/${this.props.url}/ws?game=${this.props.game}&id=${this.id}`);
    this.ws.onopen = (event) => {
      console.log('Websocket opened: %O', event);

      // add this (unnamed) player to the game
      this.ws.send(JSON.stringify({request: 'add-player'}));
    };
    this.ws.onmessage = (event) => {
      console.log('Message received: %O', event);
      MultiplayerActions.receiveMessage(JSON.parse(event.data));
    };
    this.ws.onerror = (event) => {
      console.error(event);
    };
    this.ws.onclose = (event) => {
      console.log('Websocket closed: %O', event);
    };
  }

  componentDidMount() {
    this.stylenode = _.find(document.styleSheets, (value) => {
      let { tagName, id } = value.ownerNode;
      return tagName == 'STYLE' && id == "set-dummy-style";
    });
    let cardsDiv = document.getElementById('cards');

    if (cardsDiv) {
      let cardWidthRule = `.card { width: ${cardsDiv.offsetWidth * 2 / 9}px}`,
          cardMarginRule = `.card { margin: ${cardsDiv.offsetWidth / 72}px ${cardsDiv.offsetWidth / 90}px}`;
      this.stylenode.insertRule(cardWidthRule, 0);
      this.stylenode.insertRule(cardMarginRule, 0);
    }

    MultiplayerStore.listen(this.onChange);
  }

  componentWillUnmount() {
    MultiplayerStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }

  onChangeName(evt) {
    let name = ReactDOM.findDOMNode(this.input).value;
    if (name) {
      // TODO: make this an Action
      MultiplayerActions.changeName(name);
      this.ws.send(JSON.stringify({
        request: 'change-name',
        new_name: name
      }));
    }
    else {
      MultiplayerActions.clearName();
    }
  }

  onCountdownStart(evt) {
    this.ws.send(JSON.stringify({
      request: 'countdown-start'
    }));
  }

  onClickSetCard(evt, card) {
    MultiplayerActions.selectCard(card);
    if (this.state.selected.size == 3) {
      this.ws.send(JSON.stringify({
        request: 'verify-set',
        player_id: this.state.my_player_id,
        cards: [...this.state.selected].map((string) => {
          let [number, color, shading, shape] =
              string.match(/(\w+) (\w+) (\w+) (\w+)/).slice(1);
          return {
            number, color, shading, shape
          };
        }),
      }));
      MultiplayerActions.clearSelected();
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
              <li className={player_name == this.state.my_player_id ? 'me' : ''} key={player_name}>
                <span>Player&nbsp;</span>
                <strong onClick={key == this.state.my_player_id ? this.onChangeName : _.noop}>{player_name}</strong>
                <span>:&nbsp;</span>
                <span>{`${player_found} set${player_found == 1 ? '' : 's'} found so far`}</span>
              </li>
            );
          })
        }
      </ul>
    );
  }

  renderStartButton() {
    let { current_state } = this.state;
    if (current_state == 'WAITING_FOR_CLICK_START') {
      return (
        <Button bsStyle="primary" onClick={this.onCountdownStart}>Click me to start...</Button>
      );
    }
    else if (current_state == 'WAITING_FOR_COUNTDOWN') {
      return (
        <Countdown />
      );
    }
    else {
      return null;
    }
  }

  render() {
    return (
      <div id="wrapper">
        <Modal show={!this.state.name}>
          <FormGroup controlId="change_name">
            <Modal.Body>
              <ControlLabel>Your name...</ControlLabel>
              <FormControl ref={(component) => this.input = component} />
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="primary" onClick={this.onChangeName}>{"That's Me!"}</Button>
            </Modal.Footer>
          </FormGroup>
        </Modal>
        <div id="left-sidebar">
          <h3>{this.props.game}</h3>
          {this.renderPlayers()}
          {this.renderStartButton()}
        </div>
        {this.renderCards()}
      </div>
    );
  }
}

class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      max: 100,
      value: 0
    };
    this.intervalId = null;
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
      let value = this.state.value + 1,
          max = Math.max(100, value + 5);
      this.setState({
        max: max,
        value: value
      });
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return (
      <ProgressBar active
                   bsStyle="info"
                   striped
                   min={0}
                   max={this.state.max}
                   now={this.state.value} />
    )
  }
}
