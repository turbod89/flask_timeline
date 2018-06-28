from flask_socketio import SocketIO

from .chat import Chat
from .party import Party

def init_app(app):

    socketio = SocketIO(app)
    
    socketio.on_namespace(Chat('/chat'))
    socketio.on_namespace(Party('/party'))