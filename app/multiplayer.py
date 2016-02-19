from collections import namedtuple

from app.setutils import *

class MultiplayerSet:
    set_factory = SetFactory()

    def __init__(self, initial_cards=12):
        self.initial_cards = initial_cards
        self.cards = set()
        self.players = set()
        self.deck = all_cards()
        self.started = False
        random.shuffle(self.deck)

    def start(self):
        self.cards = set(self.deck[:self.initial_cards])
        self.deck = self.deck[self.initial_cards:]

        while True:
            if len(find_all_sets(self.cards)):
                break
            for _ in range(3):
                self.cards.add(self.deck.pop())
        self.started = True

    def add_player(self):
        new_player = PlayerFactory.make_player(self)
        self.players.add(new_player)
        return new_player

    def receive_selection(self, selected, player):
        """
        Handler called when a player submits a potential set for verification.

        :param selected: the Cards in the potential set
        :param player: the player
        :return: ???
        """
        Result = namedtuple('Result', ('valid', 'old_cards', 'new_cards'))

        if any(card for card in selected if card not in self.cards):
            raise ValueError("Invalid cards")

        if is_set(selected):
            the_set = self.set_factory.make_set_from_cards(selected)
            player.found.append(the_set)
            self.cards -= the_set.cards

            new_cards = set()
            while len(self.cards) < self.initial_cards and len(self.deck):
                next_card = self.deck.pop()
                new_cards.add(next_card)
                self.cards.add(next_card)

            while len(find_all_sets(self.cards)) == 0:
                if len(self.deck) >= 3:
                    for _ in range(3):
                        next_card = self.deck.pop()
                        new_cards.add(next_card)
                        self.cards.add(next_card)
                else:
                    # TODO: figure out which exception to raise here
                    raise Exception

            return Result(SetValidation['OK'], selected, new_cards)
        else:
            return Result(SetValidation['NOT_A_SET'], selected, new_cards=None)


class PlayerFactory:

    next_id = 0

    class Player:
        def __init__(self, game, id):
            self.game = game
            self.id = id
            self.found = list()

    @staticmethod
    def make_player(game):
        # TODO: make thread-safe
        PlayerFactory.next_id += 1
        return PlayerFactory.Player(game, "P%s" % PlayerFactory.next_id)
