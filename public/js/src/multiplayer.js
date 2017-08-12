'use strict';

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, FormGroup, ControlLabel, FormControl, Button, ProgressBar } from 'react-bootstrap';
import MultiplayerStore from './stores/multiplayer';
import MultiplayerActions from './actions/multiplayer';

import SetGame from './setgame';

export default class Multiplayer extends React.Component {
  constructor(props) {
    super(props);

    const { protocol, host } = window.location;
    const { url, game, id } = this.props;

    MultiplayerActions.init({protocol, host, url, game, id});
    this.state = MultiplayerStore.getState();

    window.onbeforeunload = (event) => {
      MultiplayerActions.closeWebsocket();
      $.get('multiplayer/leave');
    };

    _.bindAll(this, 'onChange', 'onChangeName', 'onClickSetCard');
  }

  static get propTypes() {
    return {
      game: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired,
      id: React.PropTypes.string.isRequired,
      name: React.PropTypes.string,
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
    MultiplayerActions.changeName(ReactDOM.findDOMNode(this.input).value);
  }

  onClickCountdownStart(evt) {
    MultiplayerActions.startCountdown();
  }

  onClickSetCard(evt, card) {
    if (this.state.selected.size >= 3) {
      return;
    }
    MultiplayerActions.selectCard(card);
  }

  renderPlayers() {
    return (
      <ul id="players">
        <h4>Players</h4>
        {
          _.map(this.state.players, (value, key) => {
            let player_name = key, player_found = value;
            return (
              <li className={player_name == this.state.name ? 'me' : ''} key={player_name}>
                <strong onClick={key == this.state.name ? MultiplayerActions.clearName : _.noop}>{player_name}</strong>
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
        <Button bsStyle="primary" onClick={this.onClickCountdownStart}>Click me to start...</Button>
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

  renderSetGame() {
    return (
      <SetGame onClickSetCard={this.onClickSetCard.bind(this)}
               cards={this.state.cards}
               selected={this.state.selected} />
    );
  }

  renderPlayerModal() {
    if (this.state.name) {
      return null;
    }

    return (
      <Modal show={true}>
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
    )
  }

  render() {
    return (
      <div id="multiplayer" className="wrapper">
        {this.renderPlayerModal()}
        <div id="left-sidebar">
          <h3>{this.props.game}</h3>
            {this.renderPlayers()}
            {this.renderStartButton()}
        </div>
        {this.state.current_state == 'IN_PROGRESS' && this.renderSetGame()}
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
