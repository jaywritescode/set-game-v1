var Solitaire = React.createClass({
  componentWillMount: function() {
    var onSuccess = function(response) {
      console.log(response);
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

  getInitialState() {
    return {}
  },

  render: function() {
    return (
      <h3>{this.state.test ? this.state.test : void 0}</h3>
    );
  }
});

ReactDOM.render(
  <Solitaire url="/game" />, document.getElementById('solitaire')
);
