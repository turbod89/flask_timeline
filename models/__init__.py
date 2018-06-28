import click
from flask import current_app, g

from .db import db
from . import auth,main,profile

def init_app (app):
    print('models/__init__.py init_app(app)')

    db.init_app(app)
    main.init_app(app,db)
    auth.init_app(app,db)
    profile.init_app(app,db)


    def get_db_session(config = None):

        if config is None:
            config = app.config
        
        if 'session' not in g:
            g.db_session = db

        return g.db_session


    def close_db_session(e=None):
        session = g.pop('db_session', None)

        if session is not None:
            session.close()

    app.teardown_appcontext(close_db_session)


    return app