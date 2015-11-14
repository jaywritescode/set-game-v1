var Solitaire = React.createClass({
  getInitialState: function() {
    return {
      test: 'hello world'
    };
  },

  render: function() {
    return (
      <h3>{this.state.test}</h3>
    );
  }
});

ReactDOM.render(
  <Solitaire url="/index" />, document.getElementById('solitaire')
);
