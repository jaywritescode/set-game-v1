'use strict';

var Solitaire = React.createClass({
  componentWillMount: function() {
    var onSuccess = function(response) {
      this.setState({
        cards: response.cards,
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
      cards: [],
      selected: new Set()
    };
  },

  onClickSetCard: function(card, cardState) {
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
        console.log(response);
      }, (response) => {
        console.error(response);
      });
    }
  },

  render: function() {
    return (
      <ul>
        {this.state.cards.map((card) => {
          return (
            <li>
              <SetCard card={card}
                       parentHandleClick={this.onClickSetCard} />
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

  handleClick: function(e) {
    var newState = {
      selected: !this.state.selected
    };
    this.setState(newState);
    this.props.parentHandleClick(this, newState);
  },

  render: function() {
    return (
      <div className="card" onClick={this.handleClick}>{[this.props.card.number, this.props.card.color, this.props.card.shading, this.props.card.shape].join(' ')}</div>
    );
  }
});

ReactDOM.render(
  <Solitaire url="/game" />, document.getElementById('solitaire')
);
