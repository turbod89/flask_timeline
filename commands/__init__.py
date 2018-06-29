from ..models.db import db
from . import resetDb, house

def init_app(app):

    resetDb.init_app(app,db)
    house.init_app(app,db)