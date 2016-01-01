import React from 'react';

const IMG_PATH = 'static/img/';

export default class SetCard extends React.Component {
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
