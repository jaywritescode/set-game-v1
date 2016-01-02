from app.setutils import *
from app.multiplayer import *
import unittest


class MultiplayerSetTest(unittest.TestCase):
    def test_initial_deal(self):
        initial_cards = 12

        # inject a deck with a set in the first twelve cards
        _multiplayer = MultiplayerSet(12)
        deck_with_set = None
        while True:
            deck_with_set = all_cards()
            random.shuffle(deck_with_set)
            if len(find_all_sets(deck_with_set[:initial_cards])):
                break
        _multiplayer.deck = deck_with_set
        _multiplayer.initial_deal()

        self.assertEqual(initial_cards, len(_multiplayer.cards))
        self.assertGreater(len(find_all_sets(_multiplayer.cards)), 0)

        # inject a deck that doesn't have a set in the first twelve cards
        _multiplayer = MultiplayerSet()
        deck_without_set = None
        while True:
            deck_without_set = all_cards()
            random.shuffle(deck_without_set)
            if len(find_all_sets(deck_without_set[:initial_cards])) == 0:
                break
        _multiplayer.deck = deck_without_set
        _multiplayer.initial_deal()

        self.assertGreater(len(_multiplayer.cards), initial_cards)
        self.assertGreater(len(find_all_sets(_multiplayer.cards)), 0)

    def test_add_player(self):
        _multiplayer = MultiplayerSet()
        for _ in range(4):
            _multiplayer.add_player()

        self.assertEqual(len(_multiplayer.players), 4)
        self.assertEqual(len([player for player in _multiplayer.players if player.game == _multiplayer]), 4)
        self.assertEqual(len({player.id for player in _multiplayer.players}), 4)

    def test_receive_selection(self):
        _multiplayer = MultiplayerSet()
        player = _multiplayer.add_player()
        for _ in range(3):
            _multiplayer.add_player()

        # TODO: finish me!


