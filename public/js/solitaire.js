var Solitaire = React.createClass({
  componentWillMount: function() {
    var onSuccess = function(response) {
      this.setState({
        test: 'success'
      });
    }.bind(this);
    var onError = function(response) {
      this.setState({
        test: 'error'
      });
    }.bind(this);
    $.get(this.props.url).then(onSuccess, onError);
  },

  getInitialState: function() {
    return {
      test: 'nothing'
    }
  },

  render: function() {
    return (
      <h3>{this.state.test}</h3>
    );
  }
});

ReactDOM.render(
  <Solitaire url="/game" />, document.getElementById('solitaire')
);
