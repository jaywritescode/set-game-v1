import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import _ from 'lodash';
import SetCard from '../src/setcard';

describe('SetCard', function() {
  let props = {
    number: _.sample(['one', 'two', 'three']),
    color: _.sample(['red', 'green', 'blue']),
    shading: _.sample(['striped', 'solid', 'empty']),
    shape: _.sample(['diamond', 'oval', 'squiggle']),
    onClick: function() {},
  };
  let wrapper = shallow(<SetCard {...props} />);

  it('renders', function() {
    expect(wrapper).to.be.ok;
  });

  it('requests the correct card image', function() {
    expect(wrapper.find('img').props()).to.have.property('src').and.include(`${props.number}-${props.color}-${props.shading}-${props.shape}`);
  });

  context('props.selected', function() {
    it('renders the "selected" className if selected', function() {
      let wrapper = shallow(<SetCard {...(Object.assign(props, {selected: true}))} />);
      expect(wrapper.find('div.selected')).to.have.length(1);
    });

    it('does not render the "selected" className if not selected', function() {
      expect(wrapper.find('div.selected')).to.have.length(0);
    });
  });

  it("has an onClick function curried with this card's props");
});
