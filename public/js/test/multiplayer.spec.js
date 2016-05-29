import React from 'react';
import { expect } from 'chai';
import _ from 'lodash';
import { shallow, mount } from 'enzyme';
import Multiplayer from '../src/multiplayer';
import MultiplayerStore from '../src/stores/multiplayer';
import sinon from 'sinon';
import { Modal, FormControl } from 'react-bootstrap';

class MockWebSocket {
  send() {}
}

describe('Multiplayer', function() {
  let props = {
    game: 'jumpy-whale-1556',
    url: 'multiplayer-test',
  };

  beforeEach(function() {
    global.WebSocket = sinon.spy(MockWebSocket);
  });

  afterEach(function() {
    global.WebSocket = null;
  });

  describe('#componentWillMount', function() {
    it('creates a websocket', function() {
      const wrapper = shallow(<Multiplayer {...props} />);
      expect(global.WebSocket.calledOnce).to.be.true;
    });
  });

  describe('#onChangeName', function() {
    beforeEach(function() {
      sinon.stub(Multiplayer.prototype, 'componentDidMount');
    });

    afterEach(function() {
      Multiplayer.prototype.componentDidMount.restore();
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

  it('renders', function() {
    const wrapper = shallow(<Multiplayer {...props} />);
    expect(wrapper.find('div.wrapper')).to.be.ok;
  });
});
