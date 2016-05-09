import React from 'react';
import _ from 'lodash';
import SetGame from 'setgame';

const IMG_PATH = 'static/img/';

export default class SetCard extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = _.partial(this.props.onClick, _, this);
  }

  static get propTypes() {
    return {
      number: React.PropTypes.string.isRequired,
      color: React.PropTypes.string.isRequired,
      shading: React.PropTypes.string.isRequired,
      shape: React.PropTypes.string.isRequired,

      onClick: React.PropTypes.func.isRequired,
    };
  }

  static stringify(obj) {
    return `${obj.number} ${obj.color} ${obj.shading} ${obj.shape}${obj.number == 'one' ? '' : 's'}`;
  }

  content() {
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
           onClick={_.partial(this.props.onClick, _,
             _.pick(this.props, 'number', 'color', 'shading', 'shape'))}>
        {this.content()}
      </div>
    );
  }
}
