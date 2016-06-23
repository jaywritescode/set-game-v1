import React from 'react';
import { expect } from 'chai';
import _ from 'lodash';
import { shallow, mount } from 'enzyme';
import Multiplayer from '../src/multiplayer';
import MultiplayerActions from '../src/actions/multiplayer';
import MultiplayerStore from '../src/stores/multiplayer';
import sinon from 'sinon';
import { Modal, FormControl } from 'react-bootstrap';

class MockWebSocket {
  send() {}
}

const DUMMY_EVENT = global.document.createEvent('Event');

describe('Multiplayer', function() {
  let props = {
    game: 'jumpy-whale-1556',
    url: 'multiplayer-test',
  };

  let spyWebSocket = function() {
    global.WebSocket = sinon.spy(MockWebSocket);
  };
  let unspyWebSocket = function() {
    global.WebSocket = null;
  };
  let stubComponentDidMount = function() {
    sinon.stub(Multiplayer.prototype, 'componentDidMount');
  };
  let unstubComponentDidMount = function() {
    Multiplayer.prototype.componentDidMount.restore();
  };

  describe('#componentWillMount', function() {
    it('creates a websocket', function() {
      sinon.spy(global, 'WebSocket');
      const wrapper = shallow(<Multiplayer {...props} />);
      expect(global.WebSocket.calledOnce).to.be.true;
    });
  });

  describe('#onChange (via MultiplayerStore)', function() {
    describe('MultiplayerStore.onAddPlayer', function() {
      it('adds me to the game', function() {
        const wrapper = shallow(<Multiplayer {...props} />);
        // expect(wrapper.state('players')).to.be.empty;
        MultiplayerStore.listen(wrapper.instance().onChange);
        MultiplayerActions.receiveMessage({
          'action': 'add-player',
          'my_player_id': 'A',
          'players': {
            'A': 0
          },
        });
        expect(wrapper.state('players')).to.have.all.keys(['A']);
        expect(wrapper.state('my_player_id')).to.eq('A');
      });

      it('adds a different player to the game', function() {
        const wrapper = shallow(<Multiplayer {...props} />);
        MultiplayerStore.listen(wrapper.instance().onChange);
        MultiplayerActions.receiveMessage({
          'action': 'add-player',
          'my_player_id': 'A',
          'players': {
            'A': 0
          }
        });
        MultiplayerActions.receiveMessage({
          'action': 'add-player',
          'players': {
            'A': 0,
            'B': 0
          }
        });
        expect(wrapper.state('players')).to.have.all.keys(['A', 'B']);
        expect(wrapper.state('my_player_id')).to.eq('A');
      });
    });
  });

  describe('#onChangeName', function() {
    beforeEach(function() {
      stubComponentDidMount();
    });

    afterEach(function() {
      unstubComponentDidMount();
    });

    it('brings up a modal to enter a new name', function() {
      let component = <Multiplayer {...props} />;

      const wrapper = mount(component);
      wrapper.setState({
        name_input_value: '',
        players: {
          '123456789': 0
        },
      });
      MultiplayerStore.listen(wrapper.instance().onChange);

      wrapper.instance().onChangeName();
      expect(wrapper.find(Modal).prop('show')).to.be.true;
    });

    it('replaces the name locally', function() {
      let component = <Multiplayer {...props} />;

      const wrapper = mount(component);
      wrapper.setState({
        name_input_value: 'new name',
        players: {
          '123456789': 0
        },
      });
      MultiplayerStore.listen(wrapper.instance().onChange);

      wrapper.instance().onChangeName();
      expect(wrapper.find(Modal).prop('show')).to.be.false;
    });
  });

  describe('#onClickSetCard', function() {
    beforeEach(function() {
      stubComponentDidMount();
    });

    afterEach(function() {
      unstubComponentDidMount();
    });

    it('selects a card', function() {
      let card = {
        number: 'two',
        color: 'blue',
        shading: 'solid',
        shape: 'diamond'
      };
      let component = <Multiplayer {...props} />;

      const wrapper = mount(component);
      wrapper.setState({
        cards: [card]
      });
      MultiplayerStore.listen(wrapper.instance().onChange);

      wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
      expect(wrapper.state('selected').has('two blue solid diamonds')).to.be.true;
    });

    it('deselects a card', function() {
      let card = {
        number: 'two',
        color: 'blue',
        shading: 'solid',
        shape: 'diamond'
      };
      let component = <Multiplayer {...props} />;

      const wrapper = mount(component);
      let selected = new Set(['two blue solid diamonds']);
      wrapper.setState({
        cards: [card],
        selected: selected
      });
      MultiplayerStore.listen(wrapper.instance().onChange);

      wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
      expect(wrapper.state('selected').has('two blue solid diamonds')).to.be.false;
    });

    it('submits a set to the backend when we have three cards selected', function() {
      let component = <Multiplayer {...props} />;

      const wrapper = mount(component);
      MultiplayerStore.listen(wrapper.instance().onChange);

      let cards = [
        { number: 'one', color: 'green', shading: 'solid', shape: 'squiggle' },
        { number: 'two', color: 'blue', shading: 'solid', shape: 'diamond'},
        { number: 'three', color: 'red', 'shading': 'solid', shape: 'oval'}
      ];

      let spy = sinon.spy(wrapper.instance().ws, 'send');
      cards.forEach(function(card) {
        wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
      });
      expect(spy.calledOnce).to.be.true;
      expect(spy.args[0][0]).to.equal(JSON.stringify({
        request: 'verify-set',
        player_id: wrapper.state('my_player_id'),
        cards: [
          { number: 'one', color: 'green', shading: 'solid', shape: 'squiggle' },
          { number: 'two', color: 'blue', shading: 'solid', shape: 'diamonds'},
          { number: 'three', color: 'red', 'shading': 'solid', shape: 'ovals'}
        ]
      }));
    });

    it('clears the selected cards after we submit a set', function() {
      let component = <Multiplayer {...props} />;

      const wrapper = mount(component);
      MultiplayerStore.listen(wrapper.instance().onChange);

      let cards = [
        { number: 'one', color: 'green', shading: 'solid', shape: 'squiggle' },
        { number: 'two', color: 'blue', shading: 'solid', shape: 'diamonds'},
        { number: 'three', color: 'red', 'shading': 'solid', shape: 'ovals'}
      ];
      cards.forEach(function(card) {
        wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
      });
      expect(wrapper.state('selected').size).to.eq(0);
    });
  });

  describe('#render', function() {
    beforeEach(function() {
      stubComponentDidMount();
    });

    afterEach(function() {
      unstubComponentDidMount();
    });

    it('renders', function() {
      const wrapper = shallow(<Multiplayer {...props} />);
      expect(wrapper.find('div.wrapper')).to.be.ok;
    });
  });
});
