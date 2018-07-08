from ..Base import Base, db
from sqlalchemy.sql import func

from werkzeug.security import check_password_hash, generate_password_hash
import time

relCardsDecks = db.Table('relCardsDecks',
    db.Column('deck', db.Integer, db.ForeignKey('decks.id'), primary_key=True),
    db.Column('card', db.Integer, db.ForeignKey('cards.id'), primary_key=True)
)

class Card(Base):
    __tablename__ = 'cards'

    name = db.Column('name', db.String(32), nullable = False, unique = True)
    year = db.Column('year', db.Integer, nullable = False, unique = False)
    description = db.Column('description', db.String(128), nullable = True, unique = False)
    deck = db.relationship("Deck", uselist=False, backref="cards", lazy=True)
    deck_id = db.Column(db.Integer, db.ForeignKey('decks.id'))
    
    def __init__(self, **kwargs):
        super(Card, self).__init__(**kwargs)

    def __repr__(self):
        return "<Card(id='%s',name='%s')>" % (self.id, self.name)

    def __str__(self):
        return "%s (%s)" % (self.name, str(self.id))

    def serialize(self):
        obj = super(Card, self).serialize()

        obj['name'] = self.name
        obj['year'] = self.year
        obj['description'] = self.description
        obj['deck'] = { key: self.deck.serialize()[key] for key in ('id','name') }
       
        return obj
