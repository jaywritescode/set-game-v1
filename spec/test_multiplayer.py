import pytest
from app.multiplayer import *


class TestMultiplayerSet:
    def test_start_with_set_in_inital_cards(self):
        game = MultiplayerSet()

        # inject a deck with a Set in the first n cards
        game.deck = self.deck_with_set(game.initial_cards)

        game.start()
        assert len(game.cards) == game.initial_cards

    def test_start_with_no_set_in_initial_cards(self):
        game = MultiplayerSet()

        # inject a deck without a Set in the first n cards
        game.deck = self.deck_without_set(game.initial_cards)

        game.start()
        assert len(game.cards) > game.initial_cards
        assert find_any_sets(game.cards)

    def test_start_sets_started_flag(self):
        game = MultiplayerSet()

        game.start()
        assert game.started

    def test_add_player(self):
        pass

    def test_receive_selection(self):
        pass

    def deck_with_set(self, initial_cards=12):
        cards = all_cards()
        while True:
            random.shuffle(cards)
            if find_any_sets(cards[:initial_cards]):
                return cards

    def deck_without_set(self, initial_cards=12):
        cards = all_cards()
        while True:
            random.shuffle(cards)
            if not find_any_sets(cards[:initial_cards]):
                return cards
