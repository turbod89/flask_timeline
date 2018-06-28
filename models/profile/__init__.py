from ..Base import Base

from .Avatar import Avatar
from .Profile import Profile


from flask.cli import with_appcontext


def init_app(app,db):
    print('models/profile/__init__.py init_app(app)')