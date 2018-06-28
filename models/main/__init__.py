from ..Base import Base

from .Image import Image


from flask.cli import with_appcontext


def init_app(app,db):
    print('models/main/__init__.py init_app(app)')