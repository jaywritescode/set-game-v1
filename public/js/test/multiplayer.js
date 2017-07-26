import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import Multiplayer from '../src/multiplayer';
import { Button } from 'react-bootstrap';
import sinon from 'sinon';
import MultiplayerStore from '../src/actions/multiplayer';

require('locus');

describe('<Multiplayer />', function() {
  const props = {
    game: 'jumpy-whale-1179',
    url: 'multiplayer',
    id: '1',
  };

  describe('#onClickCountdownStart', function() {
    const expected = {
      'request': 'countdown-start'
    };

    it('sends a WebSocket message with a countdown-start request', function() {
      const wrapper = shallow(<Multiplayer {...props} />);
      wrapper.setState({
        name: 'John',
        players: {
          'John': 0,
          'Ron': 0,
        },
        current_state: 'WAITING_FOR_CLICK_START',
      });

      let spy = sinon.spy(wrapper.state().websocket, 'send');

      wrapper.find(Button).simulate('click');
      sinon.assert.calledWith(spy, JSON.stringify(expected));
    });
  });

  describe('#render', function() {
    it('renders', function() {
      const wrapper = shallow(<Multiplayer {...props} />);
      expect(wrapper.find('#multiplayer')).to.be.ok;
    });
  });
});
