'use strict';

import React from 'react';

import SetCard from 'setcard';

const IMG_PATH = 'static/img';

export default class SetGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: []
    };
  }

  isSelected(card) {
    return this.state.selected.has(card.toString());
  }

  renderCards() {
    return (
      <div id="cards">
        <ul>
          {this.state.cards.map((card) => {
            let { number, color, shading, shape } = card;
            return (
              <li>
                <SetCard number={number}
                         color={color}
                         shading={shading}
                         shape={shape}
                         key={card}
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
