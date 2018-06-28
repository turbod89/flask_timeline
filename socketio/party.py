from flask import g, session, request

from flask_socketio import Namespace, emit

from .. import models, routes


class Party(Namespace):

    '''
        Constructor
    '''
    def __init__(self, *args, **kwargs):
        self.connectedUsers = []
        self.cardsInGame = [
            {
                "id": 0,
                "title": "card 1",
                "pos": [0.2,0.2]
            },
            {
                "id": 1,
                "title": "card 2",
                "pos": [0.2,0.4]
            },
            {
                "id": 3,
                "title": "card 3",
                "pos": [0.6,0.8]
            },
        ]
        super(Party,self).__init__(*args,**kwargs)

    '''
        Helpers
    '''
    def emitUsers(self):
        print('\nemit\n')
        self.emit('connected_users',[{'email': user['email'],'id': user['userId']} for user in self.connectedUsers])

    def emitCards(self):
        self.emit('cards_in_game',self.cardsInGame)
        
    '''
        On connect
    '''
    def on_connect(self):
        routes.auth.load_logged_in_user()
        
        if g.me is not None:
            connUser = None
            for conn in self.connectedUsers:
                if conn['email'] == g.me.email:
                    connUser = conn

            if connUser is None:
                self.connectedUsers.append({
                    'userId': g.me.id,
                    'email': g.me.email,
                    'sid': request.sid
                })
            
            self.emitUsers()
            self.emitCards()

    
    '''
        On disconnect
    '''
    def on_disconnect(self):
        routes.auth.load_logged_in_user()

        if g.me is not None:
            conn = next( x for x in self.connectedUsers if x['userId'] == g.me.id)
            self.connectedUsers.remove(conn)
            self.emitUsers()

    
    '''
        On custom events
    '''
    def on_update_card(self,card):
        print('on update card')
        routes.auth.load_logged_in_user()
    
        if g.me is not None:
            serverCard = next(c for c in self.cardsInGame if c['id'] == card['id'])
            serverCard['pos'] = card['pos']
            self.emitCards()