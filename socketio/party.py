from flask import g, session, request

from flask_socketio import Namespace, emit, join_room, leave_room

from .. import models, routes


def load_login_or_ignore(func):
    def wrapped_func(*args, **kwargs):
        routes.auth.load_logged_in_user()
        if g.me is None:
            return None

        return func(*args, **kwargs)

    return wrapped_func


class Party(Namespace):

    '''
        Constructor
    '''
    def __init__(self, *args, **kwargs):
        self.rooms = {}
        self.connUsers = {}
        
        super(Party,self).__init__(*args,**kwargs)

    '''
        Helpers
    '''
    def emitUsers(self,room):
        players = [{'email': user.email,'id': user.id} for user in room['party'].participants]
        watchers = [{'email': connUser['user'].email,'id': connUser['user'].id} for connUser in room['watchers']]

        for player in players:
            connUser = next((connUser for connUser in room['players'] if connUser['user'].id == player['id']), None)
            player['connected'] = True if connUser is not None else False
            

        self.emit('connected_users',{
            'players': players,
            'watchers': watchers,
        },
        room = room['token'])

    def emitTableCards(self,room):
        print('emit cards')
        party = room['party']
        n = len(party.tableDeck.cards)
        print ('%s cards in table' % str(n))
        data = []
        cnt = 0
        for card in party.tableDeck.cards:
            data.append({
                'id': card.id,
                'name': card.name,
                'title': card.name,
                'year': card.year,
                'pos': [
                    (cnt+1)/(n+1),
                    0.5,
                ]
            })
            cnt = cnt + 1

        self.emit('cards_in_game',data,room=room['token'])

    def emitHandCards(self,room):
        print('emit hand cards')
        party = room['party']

        data = []
        for user in party.participants:
            cards = party.getHand(user)
            cardsData = []
            for card in cards:
                cardsData.append({
                    'id': card.id,
                    'name': card.name,
                    'title': card.name,
                })
            data.append({
                'player': {
                    'id': user.id
                },
                'cards': cardsData,
            })


        self.emit('cards_in_hands', data,room = room['token'])

    def getRoom(self, token):

        if token not in self.rooms:
            self.rooms[token] = {
                'token': token,
                'players': [],
                'watchers': [],
                'party': models.party.Party.query.filter_by(code = token).first()
            }

            if self.rooms[token]['party'].status == models.party.Party.STATE_STARTED:
                self.rooms[token]['party'].status = models.party.Party.STATE_CREATED
                self.rooms[token]['party'].start()

        return self.rooms[token]

    def addUserToRoom(self,user,room):

        if user.id in self.connUsers:
            self.removeUserFromRoom(user,self.connUsers[user.id])
        
        connUser = None
        if user.id in [user.id for user in room['party'].participants]:
            connUser = {
                'user': user,
                'sid': request.sid,
                'room': room,
            }
            room['players'].append(connUser)
        else:
            connUser = {
                'user': user,
                'sid': request.sid,
                'room': room,
            }
            room['watchers'].append(connUser)

        self.connUsers[user.id] = connUser
        join_room(room['token'])

        return connUser

    def removeUserFromRoom(self,user,room):

        if user.id not in self.connUsers:
            return

        if user.id in [user.id for user in room['party'].participants]:
            room['players'].remove(self.connUsers[user.id])
        else:
            room['watchers'].remove(self.connUsers[user.id])

        return self.connUsers.pop(user.id,None)

    def removeUserFromAnyRoom(self,user):
        if user.id in self.connUsers:
            return self.removeUserFromRoom(user,self.connUsers[user.id]['room'])
        return None
        

    def isUserInRoom(self,user,room):
        if user.id not in self.connUsers:
            return False
        return self.connUsers[user.id]['room'] == room
    
    def isUserInSomeRoom(self, user):
        if user.id not in self.connUsers:
            return False
        return self.connUsers['room'] is not None
        
    '''
        On connect
    '''
    @load_login_or_ignore
    def on_connect(self):
        pass
    
    '''
        On disconnect
    '''
    
    @load_login_or_ignore
    def on_disconnect(self):
        
        connUser = self.removeUserFromAnyRoom(g.me)
        if connUser is not None:
            self.emitUsers(connUser['room'])

    '''
        On custom events
    '''
    @load_login_or_ignore
    def on_update_card(self,card):
        serverCard = next(c for c in self.cardsInGame if c['id'] == card['id'])
        serverCard['pos'] = card['pos']
        self.emitTableCards()


    @load_login_or_ignore
    def on_join(self,roomToken):
        print('User %s joined to room %s' %(g.me,roomToken,))
        room = self.getRoom(roomToken)
        party = room['party']

        if self.isUserInRoom(g.me, room):
            pass
        else:
            self.addUserToRoom(g.me,room)
            self.emitUsers(room)
            self.emitTableCards(room)
            self.emitHandCards(room)
        
        


    
