import pytest
from app.multiplayer import *


class TestMultiplayerSet:
    @pytest.fixture
    def game(self):
        return MultiplayerSet()

    def test_start_with_set_in_initial_cards(self, game):
        # inject a deck with a Set in the first n cards
        game.deck = self.deck_with_set(game.initial_cards)
        game.start()

        assert len(game.cards) == game.initial_cards

    def test_start_with_no_set_in_initial_cards(self, game):
        # inject a deck without a Set in the first n cards
        game.deck = self.deck_without_set(game.initial_cards)
        game.start()

        assert len(game.cards) > game.initial_cards
        assert find_any_sets(game.cards)

    def test_start_sets_started_flag(self, game):
        game.start()

        assert game.started

    def test_add_player_with_name_given(self, game):
        game.start()

        player_name = 'John Q. Testington'

        test_player = game.add_player(player_name)
        assert test_player.id == player_name
        assert player_name in game.players
        assert game.players[player_name] == test_player

    def test_receive_selection_card_not_on_table(self, game):
        game.start()
        test_player = game.add_player('John Q. Testington')

        selected = None
        while True:
            two_cards = tuple(random.sample(game.cards, 2))
            completing_card = complete_set(two_cards)
            if completing_card not in game.cards:
                selected = list(two_cards) + [completing_card]
                break

        with pytest.raises(ValueError):
            assert game.receive_selection(selected, test_player)

    def test_receive_selection_correct_set(self, game):
        game.deck = self.strings_to_deck([
            "one blue empty diamond",
            "one green solid diamond",
            "two blue empty ovals",
            "two red striped squiggles",
            "two red solid squiggles",
            "one red striped oval",
            "two green solid ovals",
            "one blue empty squiggle",
            "three blue empty squiggles",
            "two blue striped diamonds",
            "two green empty squiggles",
            "two green striped diamonds",
            "two red striped ovals",
            "three green solid diamonds",
            "two red empty diamonds"
        ])
        game.start()

        test_player = game.add_player('John Q. Testington')

        selected = [self.find_card(game.cards, needle) for needle in ['one blue empty diamond', 'two blue empty ovals', 'three blue empty squiggles']]
        next_cards = game.deck[:3]

        # test:
        #
        # * the selected cards are removed from the table
        # * the next threee cards in the deck are added to the table (there is a Set in these twelve cards)
        # * the response includes a "valid" flag
        # * the response includes the selected cards
        # * the response includes the replacement cards
        # * the game is not over
        # * the player gets credit for finding the set

        actual = game.receive_selection(selected, test_player)
        assert game.cards.intersection(selected) == set()
        assert set(next_cards) < game.cards
        assert actual.valid.name == 'OK'
        assert actual.old_cards == selected
        assert actual.new_cards == next_cards
        assert not actual.game_over
        assert len(test_player.found) == 1

    def test_receive_selection_incorrect_set(self, game):
        game.deck = self.strings_to_deck([
            "one blue empty diamond",
            "one green solid diamond",
            "two blue empty ovals",
            "two red striped squiggles",
            "two red solid squiggles",
            "one red striped oval",
            "two green solid ovals",
            "one blue empty squiggle",
            "three blue empty squiggles",
            "two blue striped diamonds",
            "two green empty squiggles",
            "two green striped diamonds",
            "two red striped ovals",
            "three green solid diamonds",
            "two red empty diamonds"
        ])
        game.start()

        test_player = game.add_player('John Q. Testington')
        selected = [self.find_card(game.cards, needle) for needle in ['one green solid diamond', 'two blue empty ovals', 'two blue striped diamonds']]

        # test:
        #
        # * the selected cards remain on the table
        # * no new cards were dealt from the deck
        # * the response includes an "invalid" flag
        # * the response includes the selected cards
        # * the response does not include any replacement cards
        # * the game is not over
        # * the player does not get credit for finding the set

        actual = game.receive_selection(selected, test_player)
        assert set(selected) < game.cards
        assert len(game.cards) == game.initial_cards
        assert actual.valid.name == 'NOT_A_SET'
        assert actual.old_cards == selected
        assert not actual.new_cards
        assert not actual.game_over
        assert len(test_player.found) == 0

    def test_receive_selection_no_more_sets(self, game):
        # just one Set in these cards
        game.deck = self.strings_to_deck([
            "three blue solid squiggles",
            "three red solid ovals",
            "two green empty diamonds",
            "one red empty diamond",
            "two blue striped ovals",
            "one red solid diamond",
            "one blue empty oval",
            "one red striped oval",
            "two green empty squiggles",
            "one green empty diamond",
            "three green striped squiggles",
            "one green striped oval"
        ])
        game.start()

        test_player = game.add_player('John Q. Testington')
        selected = [self.find_card(game.cards, needle) for needle in ['three blue solid squiggles', 'one red striped oval', 'two green empty diamonds']]

        actual = game.receive_selection(selected, test_player)
        assert game.cards.intersection(selected) == set()
        assert actual.valid.name == 'OK'
        assert actual.old_cards == selected
        assert not actual.new_cards
        assert actual.game_over

    def test_receive_selection_needs_extra_cards(self, game):
        # if we remove the first three cards in this collection, then there will be no Sets in the remaining cards
        game.deck = self.strings_to_deck([
            "one blue striped diamond",
            "one blue solid diamond",
            "one blue empty diamond",
            "two red striped squiggles",            # no Set in...
            "three red striped ovals",
            "three blue solid ovals",
            "three green solid ovals",
            "two red striped diamonds",
            "three green striped squiggles",
            "one green empty oval",
            "two red solid ovals",
            "three red empty ovals",
            "two blue empty squiggles",
            "one red empty diamond",
            "two green empty ovals",                # ...these cards
            "one green empty squiggle",
            "one green striped squiggle",
            "one green solid squiggle"
        ])
        game.start()

        test_player = game.add_player('John Q. Testington')
        selected = [self.find_card(game.cards, needle) for needle in ["one blue striped diamond", "one blue solid diamond", "one blue empty diamond"]]

        game.receive_selection(selected, test_player)

        # test:
        #
        # * replacements cards are dealt until there is at least one Set on the table
        assert len(game.cards) == 15

    def test_receive_selection_needs_fewer_cards(self, game):
        # if we remove a Set from this collection, there will be another Set in the remaining twelve cards
        game.deck = self.strings_to_deck([
            "two red striped squiggles",            # no Set in...
            "three red striped ovals",
            "three blue solid ovals",
            "three green solid ovals",
            "two red striped diamonds",
            "three green striped squiggles",
            "one green empty oval",
            "two red solid ovals",
            "three red empty ovals",
            "two blue empty squiggles",
            "one red empty diamond",
            "two green empty ovals",                # ...these cards
            "three green empty ovals",              # makes a set with three red striped ovals + three blue solid ovals
            "one blue empty squiggle",              # makes a set with one green empty oval + one red empty diamond
            "one red solid squiggle",
            "two red solid squiggles",
            "three red solid squiggles",
            "one blue striped diamond"
        ])
        game.start()

        test_player = game.add_player('John Q. Testington')
        selected = [self.find_card(game.cards, needle) for needle in ["three green empty ovals", "three red striped ovals", "three blue solid ovals"]]

        game.receive_selection(selected, test_player)

        # test:
        #
        # * there are now twelve cards on the table
        assert len(game.cards) == 12


    @staticmethod
    def deck_with_set(initial_cards=12):
        cards = all_cards()
        while True:
            random.shuffle(cards)
            if find_any_sets(cards[:initial_cards]):
                return cards

    @staticmethod
    def deck_without_set(initial_cards=12):
        cards = all_cards()
        while True:
            random.shuffle(cards)
            if not find_any_sets(cards[:initial_cards]):
                return cards

    @staticmethod
    def strings_to_deck(card_strings):
        """
        Creates a deck from a list of stringified cards.

        :param card_strings: a list of "[number] [color] [shading] [shape] strings"
        :return: a list of Cards
        """
        return [CardSerializer.from_txt(card) for card in card_strings]

    @staticmethod
    def find_card(collection, needle):
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
