'use strict';

import $ from 'jquery';
import React from 'react';
import moment from 'moment';
import { Modal, Button } from 'react-bootstrap';

import SetGame from './setgame';
import SetCard from './setcard';

const IMG_PATH = 'static/img/';

export default class Solitaire extends SetGame {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      selected: new Set(),      // Set<String>
      found: new Set(),         // Set<Set<String>>
      solved: false,
    };
    this.starttime = null;
  }

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

  onClickSetCard(evt, card) {
    if (!this.starttime) {
      this.starttime = moment();
    }

    let cardString = SetCard.stringify(card);
    if (this.state.selected.has(cardString)) {
      let selectedCopy = new Set(this.state.selected);
      selectedCopy.delete(cardString);
      this.setState({
        selected: selectedCopy,
      });
    }
    else {
      this.setState({
        selected: this.state.selected.add(cardString),
      });
    }

    if (this.state.selected.size == 3) {
      let data = {
        cards: [...this.state.selected].map(SetCard.objectify)
      };
      let xhr = new XMLHttpRequest();

      xhr.open('PUT', this.props.url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = () => {
        if (xhr.status == 200) {
          let response = JSON.parse(xhr.responseText);
          switch(response['result']) {
            case 'OK':
              let r = this.state.selected;
              this.setState({
                found: this.state.found.add(new Set(r)),
                solved: response['solved'],
                selected: new Set(),
              });
              break;
            case 'NOT_A_SET':
              break;
            case 'ALREADY_FOUND':
              break;
            default:
              throw('This should never happen.');
          }
        }
      };
      xhr.send(JSON.stringify(data));
    }
  }

  onClickNewGame() {
    $.ajax(this.props.url, {
      data: { reset: true },
      method: 'GET'
    }).then((response) => {
      this.setState({
        cards: response.cards,
        selected: new Set(),
        found: new Set(),
        solved: false,
        starttime: null
      });
    }, (response) => {
      console.error(response);
    });
  }

  /**
   * @param {the_set} Set<String> - the cards in this set
   * @param {index} Number - the index of this set in the list of sets
   */
  renderSet(the_set, index) {
    return (
      <ul className="this-set" key={`found${index}`}>
        {[...the_set].map((card_string) => {
          return (
            <li key={card_string}>
              <SetCard {...SetCard.objectify(card_string)} />
            </li>
          );
        })}
      </ul>
    );
  }

  renderSetsFound() {
    return (
      <div id="found-so-far">
        <h4>Found so far:</h4>
        {
          [...this.state.found].map(this.renderSet)
        }
      </div>
    );
  }

  render() {
    return (
      <div id="wrapper">
        <Modal show={this.state.solved}>
          <Modal.Body>
            <h3 className="center">Solved! In { moment().diff(this.state.starttime, 'seconds') } seconds</h3>
          </Modal.Body>
          <Modal.Footer>
            <Button bsSize="large" bsStyle="success" onClick={this.onClickNewGame.bind(this)}>New Game...</Button>
          </Modal.Footer>
        </Modal>
        {this.renderCards()}
        {this.renderSetsFound()}
      </div>
    );
  }
}
