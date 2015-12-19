'use strict';

import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';

const IMG_PATH = '/static/img/';

class Solitaire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      selected: new Set(),
      found: new Set()
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
        <div id="cards">
          {this.state.solved ? <h3>Solved!</h3> : void 0}
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

class SetCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false
    };
  }

  handleClick(e) {
    let newState = {
      selected: !this.state.selected
    };
    this.setState(newState);
    this.props.parentHandleClick(this, newState);
  }

  content() {
    let card = this.props.card;
    let filename = `${IMG_PATH}cards/${card.number}-${card.color}-${card.shading}-${card.shape}s.png`;

    return (
      <img src={filename} />
    );
  }

  render() {
    let classes = ["card"];
    if (this.state.selected) {
      classes.push("selected");
    }
    return (
      <div className={classes.join(" ")} onClick={this.handleClick.bind(this)}>{this.content()}</div>
    );
  }
}

render(
  <Solitaire url="/game" />, document.getElementById('solitaire')
);
