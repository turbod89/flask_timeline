from ..Base import Base, db
from sqlalchemy.sql import func

from werkzeug.security import check_password_hash, generate_password_hash
import time

class Deck(Base):
    __tablename__ = 'decks'

    name = db.Column('name', db.String(32), nullable = False, unique = True)
    description = db.Column('description', db.String(128), nullable = True, unique = False)
       
    def __init__(self, **kwargs):
        super(Deck, self).__init__(**kwargs)

    def __repr__(self):
        return "<Deck(id='%s',name='%s')>" % (self.id, self.name)

    def __str__(self):
        return "%s (%s)" % (self.name, str(self.id))

    def serialize(self):
        obj = super(Deck, self).serialize()

        obj['name'] = self.name
        obj['description'] = self.description
       
        return obj





    def __len__(self):
        return len(self.cards)

    def getCards(self):
        return [card for card in self.cards]

    def getCard(self, i):
        return self.cards[i]

    def isSorted(self):
        if len(self) < 2:
            return True

        for i in range(1, len(self)):
            prevCard = self.getCard(i-1)
            currCard = self.getCard(i)
            if prevCard.year > currCard.year:
                return False

        return True

    def shuffle(self):
        random.shuffle(self.cards)
        return self

    def sort(self, reverse=False):
        self.cards.sort(reverse=reverse)
        return self

    def isEmpty(self):
        return len(self) == 0

    def take(self, num):

        if num > len(self):
            num = len(self)

        newDeck = Deck(cards=self.cards[:num])
        self.cards = self.cards[num:]
        return newDeck

    def takeCard(self, card=None):

        if self.isEmpty():
            return None
        elif card == None:
            return self.take(1)._cards[0]
        elif isinstance(card, Card) and (card in self.cards):
            self.cards.remove(card)
            return card
        else:
            return None

    def putCard(self, card, position=None):

        if position == None or position >= len(self):
            self.cards.append(card)
        else:
            self.cards.insert(max(0, position), card)

        return self
