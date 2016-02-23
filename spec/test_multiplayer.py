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

    def test_add_player_no_name_given(self):
        game = MultiplayerSet()
        game.start()

        test_player = game.add_player()
        assert test_player.id.isdigit()
        assert test_player in game.players.values()

    def test_add_player_with_name_given(self):
        game = MultiplayerSet()
        game.start()

        player_name = 'John Q. Testington'

        test_player = game.add_player(player_name)
        assert test_player.id == player_name
        assert player_name in game.players
        assert game.players[player_name] == test_player

    def test_receive_selection_card_not_on_table(self):
        game = MultiplayerSet()
        game.deck = self.load_deck()
        game.start()

        test_player = game.add_player()

        selected = list(game.cards)[:2]
        selected.append(game.deck[0])
        with pytest.raises(ValueError):
            assert game.receive_selection(selected, test_player)

    def test_receive_selection_correct_set(self):
        game = MultiplayerSet()
        game.deck = self.load_deck()
        game.start()

        test_player = game.add_player()

        selected = [self.find_card(game.cards, needle) for needle in ['one blue empty diamond', 'two blue empty ovals', 'three blue empty squiggles']]
        next_cards = game.deck[:3]

        actual = game.receive_selection(selected, test_player)
        assert game.cards.intersection(selected) == set()
        assert set(next_cards) < game.cards
        assert actual.valid.name == 'OK'
        assert actual.old_cards == selected
        assert actual.new_cards == next_cards

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

    def load_deck(self, filename='seed.txt'):
        """
        Loads a deck of Set cards from a text file.

        :param filename: the filename
        :return: a list of Cards
        """
        import os
        with open(os.path.join(pytest.config.rootdir.strpath, filename)) as file:
            return [CardSerializer.from_txt(line.strip()) for line in file]

    def find_card(self, collection, needle):
        """
        Finds the card in `collection` that matches `needle`.

        :param collection: the cards being searched
        :param needle: the Card we're looking for
        :return: the matching Card in the deck, or None
        """
        if isinstance(needle, str):
            needle = CardSerializer.from_txt(needle)
        elif isinstance(needle, dict):
            needle = CardSerializer.from_dict(needle)

        for card in collection:
            if card == needle:
                return card
        return None
