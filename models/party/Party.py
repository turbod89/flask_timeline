from ..Base import Base, db
from sqlalchemy.sql import func
from sqlalchemy import orm
from ... import models

from werkzeug.security import check_password_hash, generate_password_hash
import time

import hashlib, random

relUsersParties = db.Table('relUsersParties',
    db.Column('user', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('party', db.Integer, db.ForeignKey('parties.id'), primary_key=True)
)

relPartiesDecks = db.Table('relPartiesDecks',
    db.Column('deck', db.Integer, db.ForeignKey('decks.id'), primary_key=True),
    db.Column('party', db.Integer, db.ForeignKey('parties.id'), primary_key=True)
)

class Party(Base):
    __tablename__ = 'parties'

    STATE_CREATED = 0
    STATE_READY = 1
    STATE_FINISHED = 2

    ERROR_OK = 0
    ERROR_UNKNOW = 1

    INITIAL_NUM_CARDS = 5

    name = db.Column('name', db.String(128), nullable = False, unique = False)
    status = db.Column('status', db.Integer, nullable = False, unique = False)
    code = db.Column('code', db.String(128), nullable = False, unique = True)
    password = db.Column('password', db.String(128), nullable = True, default = None)

    participants = db.relationship('User', secondary=relUsersParties,
        backref=db.backref('parties', lazy='dynamic'))

    owner = db.relationship("User", uselist=False, backref="owned_parties", lazy=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    deck = db.relationship("Deck", uselist=False, backref="parties", lazy=True)
    deck_id = db.Column(db.Integer, db.ForeignKey('decks.id'))

    mainDeck = None
    tableDeck = None
    discartDeck = None
    userDecks = None
    dealer = 0

    
    def __init__(self, **kwargs):
        super(Party, self).__init__(**kwargs)
        self.code = hashlib.md5(str(time.time()).encode()).hexdigest()
    
    @orm.reconstructor    
    def reconstructor  (self, **kwargs):
        self.dealer = 0
        self.mainDeck = self.deck
        self.tableDeck = models.party.Deck()
        self.discartDeck = models.party.Deck()
        self.userDecks = []

    def __repr__(self):
        return "<Party(id='%s',name='%s')>" % (self.id, self.name)

    def __str__(self):
        return "%s (%s)" % (self.name, str(self.id))

    def serialize(self):
        obj = super(Party,self).serialize()
        
        obj['name'] = self.name
        obj['dealer'] = self.dealer
        obj['code'] = self.code
        obj['status'] = self.status
        obj['password'] = self.password
        obj['owner'] = { key: self.owner.serialize()[key] for key in ('id','email','first_name','last_name') }
        obj['deck'] = { key: self.deck.serialize()[key] for key in ('id','name') }
        obj['participants'] = [ { key: participant.serialize()[key] for key in ('id','email','first_name','last_name') } for participant in self.participants]

        return obj


    def __len__(self):
        return len(self.participants)

    def start(self):
        if self.status >= self.STATE_READY:
            return self.ERROR_UNKNOW
        elif len(self) < 2:
            return self.ERROR_UNKNOW
        else:
            self.status = self.STATE_READY
            self.dealer = 0
            # shuffle cards
            self.mainDeck.shuffle()
            for user in self.participants:
                self.userDecks.append(self.mainDeck.take(self.INITIAL_NUM_CARDS))
            # put first card
            card = self.mainDeck.takeCard()
            self.tableDeck.putCard(card)
        
        return self
            

    def _checkIfUserExists(self, targetUser):
        for user in self.participants:
            if user.id == targetUser.id:
                return True
        return False

    def join(self, user):
        if isinstance(user, models.auth.User):
            if self._checkIfUserExists(user):
                return self.ERROR_UNKNOW
            else:
                self.participants.append(user)
        elif type(user) == list:
            for u in user:
                error = self.join(u)
                if error != self.ERROR_OK:
                    return error
        else:
            return self.ERROR_UNKNOW

        return self.ERROR_OK

    def leave(self, user):
        if isinstance(user, models.auth.User):
            if self._checkIfUserExists(user):
                self.participants.remove(user)
            else:
                return self.ERROR_UNKNOW

        elif type(user) == list:
            
            for u in user:
                error = self.leave(u)
                if error != self.ERROR_OK:
                    return error
        else:
            return self.ERROR_UNKNOW

        return self.ERROR_OK


    def getStateDesc(self):
        if self.status == self.STATE_CREATED:
            return "Game created, just waiting to start"
        elif self.status == self.STATE_READY:
            return "Game started, playing"
        elif self.status == self.STATE_FINISHED:
            return "Game finished"
        else:
            return "Game state unknow"

    def getState(self):
        return self.status

    def getDealer(self):
        return self.participants[self.dealer % len(self.participants)]

    def getHand(self,user):
        index = self.participants.index(user)
        print(index)

        if type(index) == int:
            return self.userDecks[index]
        else:
            return self.ERROR_UNKNOW


    def _setState(self,state):
        self.status = state
        return self

    def _updateState(self):

        if self.getState() == self.STATE_READY:
            for i in range(len(self.participants)):
                if len(self.userDecks[i]) == 0:

                    return self._setState(self.STATE_FINISHED)
            
            if len(self.mainDeck) == 0:
                    return self._setState(self.STATE_FINISHED)

    def getWinner(self):
        if self.getState() != self.STATE_FINISHED:
            return False
        else:
            for i in range(len(self.participants)):
                if len(self.userDecks[i]) == 0:
                    return self.participants[i]
            return None


    def placeCard(self,card,position):
        
        if self.getState() == self.STATE_READY:
            dealer = self.getDealer()
            hand = self.getHand(dealer)
            tokenCard = hand.takeCard(card)
            
            if tokenCard == None:
                return self.ERROR_UNKNOW

            success = False
            if self.tableDeck.isEmpty():
                success = True
            elif position >= len(self.tableDeck):
                success = self.tableDeck.getCard(len(self.tableDeck)-1) <= card
            elif position == 0:
                success = card <= self.tableDeck.getCard(0)
            else:
                success = self.tableDeck.getCard(position -1) <= card and card <= self.tableDeck.getCard(position)

            self.dealer += 1
            if success:
                self.tableDeck.putCard(tokenCard,position)
            else:
                self.discartDeck.putCard(tokenCard)
                newTokenCard = self.mainDeck.takeCard()
                hand.putCard(newTokenCard)
            
            self._updateState()

            return success
            
        else:
            return self.ERROR_UNKNOW
















    def print(self):
        print ('Name:\t\'%s\'\tState:%s\t\n' % (self.name, self.getStateDesc()))
        if self.getState() == self.STATE_CREATED:
            for i in range(len(self.participants)):
                user = self.participants[i]
                print ('\t%i. %s' % (i,str(user)))

        elif self.getState() == self.STATE_READY:
            for i in range(len(self.participants)):
                user = self.participants[i]
                userDeck = self.userDecks[i]

                if self.getDealer() == user:
                    print('\t--> %i. %s\t%s' % (i, str(user),str(userDeck)))
                else:
                    print('\t    %i. %s\t%s' % (i, str(user), str(userDeck)))

            print('')
            print('\t%s' % str(self.tableDeck))
            #print('\t%s' % str(self.mainDeck))
            #print('\t%s' % str(self.discartDeck))
            print('')

