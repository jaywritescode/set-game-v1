import React from 'react';
import _ from 'lodash';
import SetGame from './setgame';

const IMG_PATH = 'static/img/';

export default class SetCard extends React.Component {
  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      number: React.PropTypes.string.isRequired,
      color: React.PropTypes.string.isRequired,
      shading: React.PropTypes.string.isRequired,
      shape: React.PropTypes.string.isRequired,
      selected: React.PropTypes.bool,
      onClick: React.PropTypes.func,
    };
  }

  static stringify(obj) {
    return `${obj.number} ${obj.color} ${obj.shading} ${obj.shape}${obj.number == 'one' ? '' : 's'}`;
  }

  static objectify(str) {
    let result = /^(\w+) (\w+) (\w+) (\w+?)s?$/.exec(str);
    if (!result) {
      return;
    }
    return _.zipObject(['number', 'color', 'shading', 'shape'], result.slice(1));
  }

  renderImage() {
    let {number, color, shading, shape} = this.props;
    let filename = `${IMG_PATH}cards/${number}-${color}-${shading}-${shape}s.png`;

    return (
      <img src={filename} />
    );
  }

  render() {
    let classes = ["card"];
    if (this.props.selected) {
      classes.push("selected");
    }
    return (
      <div className={classes.join(" ")}
           onClick={this.props.onClick ? _.partial(this.props.onClick, _, _.pick(this.props, 'number', 'color', 'shading', 'shape')) : _.noop}>
        {this.renderImage()}
      </div>
    );
  }
}
