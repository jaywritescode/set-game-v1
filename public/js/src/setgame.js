'use strict';

import React from 'react';
import SetCard from './setcard';

const IMG_PATH = 'static/img';

export default class SetGame extends React.Component {
  constructor(props) {
    super(props);
  }

  isSelected(card) {
    return this.state.selected.has(card.toString());
  }

  onClickSetCard(evt, card) {
    throw('should be implemented in subclass');
  }

  renderCards() {
    return (
      <div id="cards">
        <ul>
          {this.state.cards.map((card) => {
            let { number, color, shading, shape } = card;
            return (
              <li key={SetCard.stringify(card)}>
                <SetCard number={number}
                         color={color}
                         shading={shading}
                         shape={shape}
                         selected={this.state.selected.has(SetCard.stringify(card))}
                         onClick={this.onClickSetCard.bind(this)} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
