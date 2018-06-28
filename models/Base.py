from .db import db
from sqlalchemy.sql import func

class Base(db.Model):
    __abstract__ = True
    id = db.Column('id', db.Integer, nullable = False, primary_key = True, autoincrement = True)
    deleted = db.Column('deleted', db.Integer, nullable=False, default = 0)
    date_add = db.Column('date_add', db.DateTime, nullable=False, default = func.now())
    date_upd = db.Column('date_upd', db.DateTime, nullable=False, default = func.now())

    def serialize(self):
        return {
            'id': self.id,
            'deleted': self.deleted,
            'date_add': None if self.date_add is None else self.date_add.isoformat(),
            'date_upd': None if self.date_upd is None else self.date_upd.isoformat(),
        }
