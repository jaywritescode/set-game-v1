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
      selected: new Set(),
      found: new Set()
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
        switch(response['result']) {
          case 'OK':
            console.log('OK'); break;
            this.state.found.add(new Set(this.state.selected));
          case 'NOT_A_SET':
            console.log('NOT_A_SET'); break;
          case 'ALREADY_FOUND':
            console.log('ALREADY_FOUND'); break;
          default:
            throw("This shouldn't happen.");
        }
        console.log(this.state.selected);
        for (card of this.state.selected) {
          card.setState({
            selected: false
          });
        }
        this.state.selected.clear();
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
    let classes = ["card"];
    if (this.state.selected) {
      classes.push("selected");
    }
    return (
      <div className={classes.join(" ")} onClick={this.handleClick}>{[this.props.card.number, this.props.card.color, this.props.card.shading, this.props.card.shape].join(' ')}</div>
    );
  }
});

ReactDOM.render(
  <Solitaire url="/game" />, document.getElementById('solitaire')
);
