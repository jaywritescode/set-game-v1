'use strict';

import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';
import { Button } from 'react-bootstrap';

import Solitaire from 'solitaire';
import Multiplayer from 'multiplayer';

class SetApp extends React.Component {
  startSolitaire() {
    $.get('/solitaire').then((response) => {
      render(
        <Solitaire url="/game" />, document.getElementById('content')
      );
    });
  }

  startMultiplayer() {
    $.get('/multiplayer').then((response) => {
      render(
        <Multiplayer url="/game" />, document.getElementById('content')
      );
    });
  }

  render() {
    return (
      <div id="index-wrapper">
        <Button bsSize="large" bsStyle="default" onClick={this.startSolitaire}>Solitaire Set</Button>
        <Button bsSize="large" bsStyle="default" onClick={this.startMultiplayer}>Multiplayer Set</Button>
      </div>
    );
  }
}

render(
  <SetApp />, document.getElementById('content')
);
