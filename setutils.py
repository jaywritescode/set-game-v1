from enum import Enum
import random
import itertools
import operator
from functools import reduce

Number = Enum('number', ('one', 'two', 'three'))
Color = Enum('color', ('red', 'green', 'blue'))
Shading = Enum('shading', ('empty', 'striped', 'solid'))
Shape = Enum('shape', ('oval', 'diamond', 'squiggle'))

game_attrs = [Number, Color, Shading, Shape]


class Card:
    def __init__(self, number, color, shading, shape):
        self.number = number
        self.color = color
        self.shading = shading
        self.shape = shape

    def attribute(self, enum_type):
        """
        Get this card's *enum_type*.

        :param enum_type: an enum type
        :return: the value of this card's attribute that matches *enum_type*
        """
        return self.__getattribute__(enum_type.__name__)

    def get_number(self):
        return self.number.name

    def get_color(self):
        return self.color.name

    def get_shading(self):
        return self.shading.name

    def get_shape(self):
        return self.shape.name

    @staticmethod
    def number(arg):
        return Number[arg]

    @staticmethod
    def color(arg):
        return Color[arg]

    @staticmethod
    def shading(arg):
        return Shading[arg]

    @staticmethod
    def shape(arg):
        return Shape[arg]

    def to_hash(self):
        return {k: self.__dict__[k].name for k in ['number', 'color', 'shading', 'shape']}

    @staticmethod
    def from_obj(obj):
        """
        Turn an object with "number", "color", "shading", and "shape" attributes into a Card.

        :param obj: the collection of attributes
        :return: the Card with those attributes
        """
        number = Number[obj['number']]
        color = Color[obj['color']]
        shading = Shading[obj['shading']]
        shape = Shape[obj['shape']]
        return Card(number, color, shading, shape)

    def __str__(self):
        string = '%s %s %s %s' % (self.number.name, self.color.name, self.shading.name, self.shape.name)
        if self.number != Number['one']:
            string += 's'
        return string

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __hash__(self):
        if not hasattr(self, 'hash'):
            self.hash = hash(self.number) ^ hash(self.color) ^ hash(self.shading) ^ hash(self.shape)
        return self.hash


    @staticmethod
    def random():
        return Card(*(random.choice(list(enum_type)) for enum_type in game_attrs))


class SetFactory:
    class Set:
        def __init__(self, cards):
            self.cards = set(cards)

        def __eq__(self, other):
            if hasattr(other, 'cards'):
                other = other.cards
            return self.cards == other

        def __hash__(self):
            return reduce(operator.xor, (hash(card) for card in self.cards))

        def __len__(self):
            return len(self.cards)

        def __str__(self):
            return "<%s>" % ', '.join(str(card) for card in self.cards)


    @staticmethod
    def make_set_from_cards(cards):
        """
        Create a Set if *cards* make a valid Set, otherwise do nothing.

        :param cards: a collection of cards
        :return: a Set containing *cards*, if *cards* makes a valid set,
        otherwise None.
        :throws: ValueError if passed other than three cards
        """
        if len(cards) != 3:
            raise ValueError("Expected exactly three cards, got %s" % len(cards))
        return SetFactory.Set(cards) if is_set(cards) else None


    @staticmethod
    def make_random_set():
        """
        Create a random, valid Set.

        :return: a random, valid Set
        """
        funcs = [SetFactory.make_same_iterable, SetFactory.make_diff_iterable]
        attrs_fns = None

        # ensure at least one attribute will be different among the three cards
        while True:
            attrs_fns = [random.choice(funcs) for _ in range(len(game_attrs))]
            if any(f == SetFactory.make_diff_iterable for f in attrs_fns):
                break
        attrs = [attrs_fns[i](game_attrs[i]) for i in range(len(game_attrs))]

        return SetFactory.make_set_from_cards({Card(*p) for p in zip(*attrs)})

    @staticmethod
    def make_not_set():
        """
        Make a random triple of Cards that's not a Set

        :return: a lowercase-S set of three Cards that are not a valid Set
        """
        attrs = [SetFactory.make_pair_iterable(enum_type) for enum_type in game_attrs]
        return {Card(*p) for p in zip(*attrs)}

    @staticmethod
    def make_same_iterable(enum_type, iterable_len=3):
        """
        Choose a random member of *enum_type* m and make an iterable of
        *iterable_len* whose members are all m.

        :param enum_type: the enum type
        :param iterable_len: the length of iterable to return
        :return: the iterable, as described above
        """
        return [random.choice(list(enum_type))] * iterable_len

    @staticmethod
    def make_diff_iterable(enum_type):
        """
        Make an iterable that contains each member of *enum_type* once and
        only once.

        :param enum_type: the enum type
        :return: the iterable, as described above
        """
        p = list(enum_type)
        random.shuffle(p)
        return p

    @staticmethod
    def make_pair_iterable(enum_type):
        """
        Make an iterable of members of *enum_type* such that two of the
        iterable's elements are the same and the third is different from
        the other two.

        :param enum_type: the enum type
        :return: the iterable, as described above
        """
        i = SetFactory.make_same_iterable(enum_type)
        k = list(set(enum_type) - {i[0]})
        i[random.randrange(len(i))] = random.choice(k)
        return i


def all_cards():
    """
    Get all 81 possible cards, in a list.

    :return: a list of all possible cards
    """
    return [Card(number, color, shading, shape)
            for number in Number
            for color in Color
            for shading in Shading
            for shape in Shape]


def is_set(cards):
    """
    Determines if the given cards make a set.

    :param cards: a 3-ple of Cards
    :return: True iff cards make a valid Set
    """
    def all_same(a, b, c):
        return a == b and b == c

    def all_diff(a, b, c):
        return a != b and b != c and a != c

    def attr_match(a, b, c):
        return all_same(a, b, c) or all_diff(a, b, c)

    retval = True
    for attr in ['number', 'color', 'shading', 'shape']:
        if not attr_match(*(card.__getattribute__(attr) for card in cards)):
            retval = False

    return retval


def complete_set(cards):
    """
    Given two cards, determine the unique card that completes the set.

    :param cards: a 2-ple of cards
    :return: a Card that completes the set
    """
    newattrs = list()
    for (attr, name) in [(a, a.__name__) for a in game_attrs]:
        if cards[0].__getattribute__(name) == cards[1].__getattribute__(name):
            newattrs.append(cards[0].__getattribute__(name))
        else:
            newattrs.append((set(attr) - {c.__getattribute__(name) for c in cards}).pop())
    return Card(*newattrs)


def find_all_sets(cards):
    """
    Find all Sets that can be made from the given cards
    :param cards: a collection of cards
    :return: a set of all Sets that can be made from *cards*
    """
    return {SetFactory.make_set_from_cards(combo) for combo in itertools.combinations(cards, 3) if is_set(combo)}


###########################################################################
# crazy geometric methods
#
# Here's an interesting Euclidean geometry analogy:
#
# Two points determine a line.
# Two cards determine a Set.
#
# So two Sets are "parallel" if they share no cards in common, and they
# "intersect" if they share one card in common
###########################################################################
def are_parallel(sets):
    """
    Determine if two (or more) Sets are parallel.

    :param sets: a collection of Sets
    :return: True iff all sets are parallel with each other
    """
    return len(reduce(set.union, (s.cards for s in sets))) == sum(len(x) for x in sets)


def are_intersecting(sets):
    """
    Determine if two (or more) sets intersect at a single point, i.e. if
    all sets share a single common card

    :param sets: a collection of Sets
    :return: True iff all sets share a single common card
    """
    return len(reduce(set.intersection, (s.cards for s in sets))) == 1
