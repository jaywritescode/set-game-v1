import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import Solitaire from '../src/solitaire';
import SetCard from '../src/setcard';
import sinon from 'sinon';

const DUMMY_EVENT = global.document.createEvent('Event');

describe('Solitaire', function() {
  let props = {
    url: 'solitaire-test'
  };
  const response = {
    "cards": [
      {"number": "two", "shading": "striped", "color": "red", "shape": "oval"},
      {"number": "one", "shading": "striped", "color": "red", "shape": "oval"},
      {"number": "three", "shading": "striped", "color": "red", "shape": "squiggle"},
      {"number": "one", "shading": "solid", "color": "green", "shape": "diamond"},
      {"number": "one", "shading": "empty", "color": "green", "shape": "oval"},
      {"number": "one", "shading": "striped", "color": "green", "shape": "squiggle"},
      {"number": "three", "shading": "empty", "color": "blue", "shape": "squiggle"},
      {"number": "two", "shading": "solid", "color": "green", "shape": "oval"},
      {"number": "one", "shading": "striped", "color": "blue", "shape": "diamond"},
      {"number": "one", "shading": "empty", "color": "blue", "shape": "diamond"},
      {"number": "two", "shading": "striped", "color": "green", "shape": "oval"},
      {"number": "three", "shading": "solid", "color": "blue", "shape": "oval"}
    ]};

  describe('#componentWillMount', function() {
    beforeEach(function() {
      let requests = this.requests = [];

      global.window.XMLHttpRequest.onCreate = function(xhr) {
        requests.push(xhr);
      };
    });

    it('retrieves cards from the server', function() {
      const wrapper = shallow(<Solitaire {...props} />);
      this.requests[0].respond(200, {
        'Content-Type': 'application/json'
      }, JSON.stringify(response));
      expect(wrapper.state('cards')).deep.equals(response.cards);
    });
  });

  describe('#onClickSetCard', function() {
    it('stores the start time', function() {
      const wrapper = shallow(<Solitaire {...props} />);
      wrapper.instance().onClickSetCard(DUMMY_EVENT, response.cards[0]);
      expect(wrapper.state('starttime')).to.be.ok;
    });

    it('selects a card', function() {
      let card = response.cards[0];

      const wrapper = shallow(<Solitaire {...props} />);
      wrapper.setState({
        cards: response.cards
      });

      wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
      expect(wrapper.state('selected').has(SetCard.stringify(card))).to.be.true;
    });

    it('deselects a card', function() {
      let card0 = response.cards[0], card1 = response.cards[1];

      const wrapper = shallow(<Solitaire {...props} />);
      let selected = new Set([SetCard.stringify(card0), SetCard.stringify(card1)]);
      wrapper.setState({
        cards: response.cards,
        selected: selected
      });

      wrapper.instance().onClickSetCard(DUMMY_EVENT, card0);
      expect(wrapper.state('selected').has(SetCard.stringify(card0))).to.be.false;
    });

    context('server request and response', function() {
      beforeEach(function() {
        let requests = this.requests = [];

        global.window.XMLHttpRequest.onCreate = function(xhr) {
          requests.push(xhr);
        };
      });

      it('submits a set to the backend when we have three cards selected', function() {
        const wrapper = shallow(<Solitaire {...props} />);
        wrapper.setState({
          cards: response.cards
        });

        response.cards.slice(0,3).forEach(function(card) {
          wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
        });
        expect(this.requests).to.have.length(2);
        expect(this.requests[1].url).to.equal(props.url);
        expect(this.requests[1].method).to.equal('PUT');
        expect(JSON.parse(this.requests[1].requestBody)).to.deep.equal({cards: response.cards.slice(0,3)});
      });

      context('valid set', function() {
        it('adds the new set to the set of found sets', function() {
          const wrapper = shallow(<Solitaire {...props} />);
          wrapper.setState({
            cards: response.cards
          });

          expect(() => {
            response.cards.slice(0,3).forEach(function(card) {
              wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
            });
            this.requests[1].respond(200, {}, JSON.stringify({
              result: 'OK',
              solved: false
            }));
          }).to.increase(wrapper.state('found'), 'size');
        });

        it('updates the game-over status', function() {
          const wrapper = shallow(<Solitaire {...props} />);
          wrapper.setState({
            cards: response.cards
          });

          response.cards.slice(0,3).forEach(function(card) {
            wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
          });
          this.requests[1].respond(200, {}, JSON.stringify({
            result: 'OK',
            solved: true,
          }));
          expect(wrapper.state('solved')).to.be.true;
        });

        it('renders the new set', function() {
          const wrapper = mount(<Solitaire {...props} />);
          wrapper.setState({
            cards: response.cards
          });

          response.cards.slice(0,3).forEach(function(card) {
            wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
          });
          this.requests[1].respond(200, {}, JSON.stringify({
            result: 'OK',
            solved: false,
          }));
          expect(wrapper.find('ul.this-set')).to.have.length(1);
          expect(wrapper.find('ul.this-set').find(SetCard)).to.have.length(3);
          expect(wrapper.find('ul.this-set').containsMatchingElement(
            <SetCard {...response.cards[0]} />
          )).to.be.true;
          expect(wrapper.find('ul.this-set').containsMatchingElement(
            <SetCard {...response.cards[1]} />
          )).to.be.true;
          expect(wrapper.find('ul.this-set').containsMatchingElement(
            <SetCard {...response.cards[2]} />
          )).to.be.true;
        });

        it('clears the selected cards', function() {
          const wrapper = shallow(<Solitaire {...props} />);
          wrapper.setState({
            cards: response.cards
          });

          response.cards.slice(0,3).forEach(function(card) {
            wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
          });
          this.requests[1].respond(200, {}, JSON.stringify({
            result: 'OK',
            solved: true,
          }));
          expect(wrapper.state('selected').size).to.equal(0);
        });
      });

      context('invalid set', function() {
        it('does not add the new set to the set of found sets', function() {
          const wrapper = shallow(<Solitaire {...props} />);
          wrapper.setState({
            cards: response.cards
          });

          expect(() => {
            response.cards.slice(0,3).forEach(function(card) {
              wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
            });
            this.requests[1].respond(200, {}, JSON.stringify({
              result: 'NOT_A_SET',
            }));
          }).to.not.change(wrapper.state('found'), 'size');
        });
      });

      context('already found', function() {
        it('does not add the new set to the set of found sets', function() {
          const wrapper = shallow(<Solitaire {...props} />);
          wrapper.setState({
            cards: response.cards
          });

          response.cards.slice(0,3).forEach(function(card) {
            wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
          });
          this.requests[1].respond(200, {}, JSON.stringify({
            result: 'OK',
            solved: false,
          }));

          expect(() => {
            response.cards.slice(0,3).forEach(function(card) {
              wrapper.instance().onClickSetCard(DUMMY_EVENT, card);
            });
            this.requests[2].respond(200, {}, JSON.stringify({
              result: 'ALREADY_FOUND',
            }));
          }).to.not.change(wrapper.state('found'), 'size');
        });
      });
    });
  });
});
