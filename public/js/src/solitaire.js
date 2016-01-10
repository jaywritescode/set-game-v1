'use strict';

import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';
import { Modal, Button } from 'react-bootstrap';
import moment from 'moment';

import SetCard from 'setcard';

const IMG_PATH = 'static/img/';

export default class Solitaire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      selected: new Set(),
      found: new Set(),
    };
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

  onClickSetCard(card, cardState) {
    if (!this.state.starttime) {
      this.state.starttime = moment();
    }

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
      }).then((response) => {
        switch(response['result']) {
          case 'OK':
            console.log('OK');
            this.setState({
              found: this.state.found.add(new Set(this.state.selected)),
              solved: response['solved']
            });
            break;
          case 'NOT_A_SET':
            console.log('NOT_A_SET'); break;
          case 'ALREADY_FOUND':
            console.log('ALREADY_FOUND'); break;
          default:
            throw("This shouldn't happen.");
        }
      }, (response) => {
        console.error(response);
      }).then(() => {
        console.log(this.state.selected);
        for (card of this.state.selected) {
          card.setState({
            selected: false
          });
        }
        this.state.selected.clear();
        console.log(this.state.selected);
      });
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

  renderSet(the_set) {
    return (
      <ul className="this-set">
        {[...the_set].map((card_component) => {
          return (
            <li>{card_component.content()}</li>
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
          [...this.state.found].map((the_set) => {
            return this.renderSet(the_set);
          })
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
        <div id="cards">
          <ul>
            {this.state.cards.map((card) => {
              return (
                <li>
                  <SetCard card={card}
                           parentHandleClick={this.onClickSetCard.bind(this)} />
                </li>
              );
            })}
          </ul>
        </div>
        {this.renderSetsFound()}
      </div>
    );
  }
}
