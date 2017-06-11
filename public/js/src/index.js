'use strict';

import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';
import { Button, MenuItem, Dropdown } from 'react-bootstrap';

import Solitaire from './solitaire';
import Multiplayer from './multiplayer';

class SetApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: {}
    };
  }

  componentWillMount() {
    this.requestGamesStatus();
  }

  startSolitaire() {
    $.get('/solitaire').then((response) => {
      render(
        <Solitaire url="/solitaire" {...response} />, document.getElementById('content')
      );
    });
  }

  startMultiplayer(gameName) {
    return (evt) => {
      $.get('/multiplayer/go', {
        name: gameName
      }).then((response) => {
        render(
          <Multiplayer url="multiplayer" {...response} />, document.getElementById('content')
        );
      });
    };
  }

  requestGamesStatus() {
    let onSuccess = function(response) {
      this.setState({
        'games': response
      });
    }.bind(this);
    let onError = function(response) {
      this.setState({
        'error': response
      });
    }.bind(this);
    $.get('/multiplayer/status').then(onSuccess, onError);
  }

  render() {
    return (
      <div id="index-wrapper">
        <Button bsSize="large"
                bsStyle="default"
                key="solitaire"
                onClick={this.startSolitaire}
                id="solitaire_button">Solitaire Set</Button>
        <Dropdown id="multiplayer_button"
                  onToggle={(isOpen) => { isOpen && this.requestGamesStatus(); }}>
          <Button bsSize="large"
                  bsStyle="default"
                  key="multiplayer"
                  onClick={this.startMultiplayer()}>Multiplayer Set</Button>
          <Dropdown.Toggle bsSize="large" />
          <Dropdown.Menu>
            {$.map(this.state.games, (value, key) => {
              return (
                <MenuItem eventKey={key}
                          key={key}
                          onSelect={this.startMultiplayer(key)}>
                  {`${key} => ${value} player${value == 1 ? '' : 's'}`}
                </MenuItem>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}

render(
  <SetApp />, document.getElementById('content')
);
