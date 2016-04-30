'use strict';

import React from 'react';

import SetCard from 'setcard';

const IMG_PATH = 'static/img';

export default class SetGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      selected: new Set()
    };
  }

  renderCards() {
    console.log('SetGame.renderCards: %O', this.state.cards);
    return (
      <div id="cards">
        <ul>
          {this.state.cards.map((card) => {
            return (
              <li>
                <SetCard card={card}
                         key={card}
                         parentHandleClick={this.onClickSetCard.bind(this)} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
