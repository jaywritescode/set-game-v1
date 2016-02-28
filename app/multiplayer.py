from collections import namedtuple

from app.setutils import *

class MultiplayerSet:
    set_factory = SetFactory()

    def __init__(self, initial_cards=12):
        self.initial_cards = initial_cards
        self.cards = set()
        self.players = dict()
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

    def add_player(self, name=None):
        """
        Creates a new player and assigns it to this game.

        :param name: the player's name, or None to generate a random name
        :return: the player
        """
        new_player = PlayerFactory.make_player(self, name)
        self.players[new_player.id] = new_player
        return new_player

    def receive_selection(self, selected, player):
        """
        Handler called when a player submits a potential set for verification.

        :param selected: a collection of Cards in the potential set
        :param player: the player
        :return: ???
        """
        Result = namedtuple('Result', ('valid', 'old_cards', 'new_cards', 'game_over'))

        if any(card for card in selected if card not in self.cards):
            raise ValueError("Invalid cards")

        if is_set(selected):
            the_set = self.set_factory.make_set_from_cards(selected)
            player.found.append(the_set)
            self.cards -= the_set.cards

            if len(self.cards) < self.initial_cards and len(self.deck):
                new_cards, self.deck = self.deck[:3], self.deck[3:]
                self.cards.update(new_cards)
            else:
                new_cards = list()

            while len(find_all_sets(self.cards)) == 0:
                if len(self.deck):
                    new_cards.extend(self.deck[:3])
                    self.cards.update(new_cards)
                    self.deck = self.deck[3:]
                else:
                    return Result(SetValidation['OK'], selected, new_cards=None, game_over=True)

            return Result(SetValidation['OK'], selected, new_cards, game_over=False)
        else:
            return Result(SetValidation['NOT_A_SET'], selected, new_cards=None, game_over=False)


class PlayerFactory:
    class Player:
        def __init__(self, game, id):
            self.game = game
            self.id = id
            self.found = list()

    @staticmethod
    def make_player(game, name):
        while name is None or name in game.players:
            name = PlayerFactory.random_name()
        return PlayerFactory.Player(game, name)

    @staticmethod
    def random_name():
        return ''.join(random.choice('0123456789') for _ in range(10))
