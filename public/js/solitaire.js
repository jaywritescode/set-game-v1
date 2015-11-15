var Solitaire = React.createClass({
  componentWillMount: function() {
    var onSuccess = function(response) {
      this.setState({
        cards: response.cards
      });
    }.bind(this);
    var onError = function(response) {
      this.setState({
        error: response
      });
    }.bind(this);
    $.get(this.props.url).then(onSuccess, onError);
  },

  getInitialState() {
    return {
      cards: []
    };
  },

  render: function() {
    return (
      <ul>
        {this.state.cards.map(function(card) {
          return (
            <li>
              <SetCard number={card.number}
                       color={card.color}
                       shading={card.shading}
                       shape={card.shape} />
            </li>
          );
        })}
      </ul>
    );
  }
});

var SetCard = React.createClass({
  getInitialState() {
    return {
      selected: false
    };
  },

  render: function() {
    return (
      <div className="card">{[this.props.number, this.props.color, this.props.shading, this.props.shape].join(' ')}</div>
    );
  }
});

ReactDOM.render(
  <Solitaire url="/game" />, document.getElementById('solitaire')
);
