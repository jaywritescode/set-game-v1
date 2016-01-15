'use strict';

import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';
import { Button, SplitButton, MenuItem } from 'react-bootstrap';

import Solitaire from 'solitaire';
import Multiplayer from 'multiplayer';

class SetApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: {}
    };
  }

  componentWillMount() {
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
    $.get('/multiplayer').then(onSuccess, onError);
  }

  startSolitaire() {
    $.get('/solitaire').then((response) => {
      render(
        <Solitaire url="/solitaire" />, document.getElementById('content')
      );
    });
  }

  startMultiplayer(gameName) {
    return (evt) => {
      $.get('/multiplayer/go', {
        name: gameName
      }).then((response) => {
        render(
          <Multiplayer url="multiplayer" name={response.name}/>, document.getElementById('content')
        );
      });
    };
  }

  render() {
    return (
      <div id="index-wrapper">
        <Button bsSize="large"
                bsStyle="default"
                key="solitaire"
                onClick={this.startSolitaire}
                id="solitaire_button">Solitaire Set</Button>
        <SplitButton bsSize="large"
                     bsStyle="default"
                     key="multiplayer"
                     title="Multiplayer Set"
                     id="multiplayer_split_button"
                     onClick={this.startMultiplayer()}>
          {$.map(this.state.games, (value, key) => {
            return (
              <MenuItem eventKey={key}
                        key={key}
                        onSelect={this.startMultiplayer(key)}>
                {`${key} => ${value} player${value == 1 ? '' : 's'}`}
              </MenuItem>
            );
          })}
        </SplitButton>
      </div>
    );
  }
}

render(
  <SetApp />, document.getElementById('content')
);
