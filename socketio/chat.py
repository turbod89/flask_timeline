from flask import g, session, request

from flask_socketio import Namespace, emit

from .. import models, routes

def load_login_or_ignore(func):
    def wrapped_func(*args,**kwargs):
        routes.auth.load_logged_in_user()
        if g.me is None:
            return None

        return func(*args,**kwargs)

    return wrapped_func

class Chat(Namespace):

    '''
        Constructor
    '''
    def __init__(self, *args, **kwargs):
        self.connected_users = []
        self.unrecived_messages = []
        super(Chat,self).__init__(*args,**kwargs)

    '''
        Helpers
    '''
    def emitUsers(self):
        print('\nemit\n')
        self.emit('connected_users',[{'email': user['email']} for user in self.connected_users])

    '''
        On connect
    '''
    @load_login_or_ignore
    def on_connect(self):


        connUser = None
        for conn in self.connected_users:
            if conn['email'] == g.me.email:
                connUser = conn

        if connUser is None:
            self.connected_users.append({
                'userId': g.me.id,
                'email': g.me.email,
                'sid': request.sid
            })

            self.emitUsers()
            
            # send unseen messages
            new_unrecived_messages = []
            for unrecived_message in self.unrecived_messages:
                if unrecived_message['to_email'] == g.me.email:
                    self.emit('get_message_from_user',(unrecived_message['from_email'], unrecived_message['message'],), room=request.sid)
                else:
                    new_unrecived_messages.append(unrecived_message)
            self.unrecived_messages = new_unrecived_messages


    
    '''
        On disconnect
    '''
    @load_login_or_ignore
    def on_disconnect(self):

        conn = next( x for x in self.connected_users if x['userId'] == g.me.id)
        self.connected_users.remove(conn)
        self.emitUsers()

    
    '''
        On custom events
    '''
    @load_login_or_ignore
    def on_send_message_to_user(self,email,message):

        conn = next( (x for x in self.connected_users if x['email'] == email), None)
        if conn is not None:
            self.emit('get_message_from_user',(g.me.email, message,), room=conn['sid'])
        else:
            self.unrecived_messages.append({
                'from_email': g.me.email,
                'to_email': email,
                'message': message,
            })