from flask import g, session, request

from flask_socketio import Namespace, emit

from .. import models, routes


class Chat(Namespace):

    '''
        Constructor
    '''
    def __init__(self, *args, **kwargs):
        self.connectedUsers = []
        super(Chat,self).__init__(*args,**kwargs)

    '''
        Helpers
    '''
    def emitUsers(self):
        print('\nemit\n')
        self.emit('connected_users',[{'email': user['email']} for user in self.connectedUsers])

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
    def on_send_message_to_user(self,email,message):
        
        routes.auth.load_logged_in_user()
        
        if g.me is not None:
            conn = next( x for x in self.connectedUsers if x['email'] == email)
            self.emit('get_message_from_user',(g.me.email, message,), room=conn['sid'])