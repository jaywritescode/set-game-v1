'use strict';

import React from 'react';
import moment from 'moment';
import { Modal, Button } from 'react-bootstrap';

import SetGame from './setgame';
import SetCard from './setcard';

export default class Solitaire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: new Set(),      // Set<String>
      found: new Set(),         // Set<Set<String>>
      solved: false,
      starttime: null,
    };
  }

  /**
   * @param {Event} evt - the event
   * @param {Object} card - the card we clicked
   */
  onClickSetCard(evt, card) {
    let newState = {};
    if (!this.state.starttime) {
      Object.assign(newState, {starttime: moment()});
    }

    let cardString = SetCard.stringify(card);
    if (this.state.selected.has(cardString)) {
      let selectedCopy = new Set(this.state.selected);
      selectedCopy.delete(cardString);
      Object.assign(newState, {selected: selectedCopy});
    }
    else {
      Object.assign(newState, this.setState({
        selected: this.state.selected.add(cardString)
      }));
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
              this.setState({
                selected: new Set(),
              });
              break;
            default:
              throw('This should never happen.');
          }
        }
      };
      xhr.send(JSON.stringify(data));
    }

    this.setState(newState);
  }

  onClickNewGame() {
    fetch(`${this.props.url}?reset=true`)
      .then(response => response.json())
      .then(data => {
        this.setState({
          cards: data.cards,
          selected: new Set(),
          found: new Set(),
          solved: false,
          starttime: null
        });
      });
  }

  /**
   * @param {Set<String>} the_set - the cards in this set
   * @param {Number} index - the index of this set in the list of sets
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
      <div id="solitaire" className="wrapper">
        <Modal show={this.state.solved}>
          <Modal.Body>
            <h3 className="center">Solved! In { moment().diff(this.state.starttime, 'seconds') } seconds</h3>
          </Modal.Body>
          <Modal.Footer>
            <Button bsSize="large" bsStyle="success" onClick={this.onClickNewGame.bind(this)}>New Game...</Button>
          </Modal.Footer>
        </Modal>
        <SetGame
          onClickSetCard={this.onClickSetCard.bind(this)}
          cards={this.props.cards}
          selected={this.state.selected}
        />
        {this.renderSetsFound()}
      </div>
    );
  }
}
