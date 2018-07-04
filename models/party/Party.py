from ..Base import Base, db
from sqlalchemy.sql import func

from werkzeug.security import check_password_hash, generate_password_hash
import time

relUsersParties = db.Table('relUsersParties',
    db.Column('user', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('party', db.Integer, db.ForeignKey('parties.id'), primary_key=True)
)

class Party(Base):
    __tablename__ = 'parties'

    name = db.Column('name', db.String(128), nullable = False, unique = False)
    status = db.Column('status', db.String(32), nullable = True, unique = False)
    code = db.Column('code', db.String(128), nullable = False, unique = True)
    password = db.Column('password', db.String(128), nullable = True, default = None)

    participants = db.relationship('User', secondary=relUsersParties,
        backref=db.backref('parties', lazy='dynamic'))

    owner = db.relationship("User", uselist=False, backref="owned_parties", lazy=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    def __init__(self, **kwargs):
        super(Party, self).__init__(**kwargs)
        self.code = generate_password_hash(str(time.time()))

    def __repr__(self):
        return "<Party(id='%s',name='%s')>" % (self.id, self.name)

    def __str__(self):
        return "%s (%s)" % (self.name, str(self.id))

    def serialize(self):
        obj = super(Party,self).serialize()
        
        obj['name'] = self.name
        obj['code'] = self.code
        obj['status'] = self.status
        obj['password'] = self.password
        obj['owner'] = { key: self.owner.serialize()[key] for key in ('id','email','first_name','last_name') }
        obj['participants'] = [ { key: participant.serialize()[key] for key in ('id','email','first_name','last_name') } for participant in self.participants]

        return obj
