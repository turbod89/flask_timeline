from ..Base import Base, db
from .Group import Group
from ..profile import Profile
from sqlalchemy.sql import func

relUsersGroups = db.Table('relUsersGroups',
    db.Column('user', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('group', db.Integer, db.ForeignKey('groups.id'), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'

    #first_name = db.Column('first_name', db.String(32), nullable = True)
    #last_name = db.Column('last_name', db.String(32), nullable = True)
    email = db.Column('email', db.String(128), nullable = False, unique = True)
    password = db.Column('password', db.String(128), nullable = False)

    groups = db.relationship('Group', secondary=relUsersGroups,
        backref=db.backref('users', lazy='dynamic'))

    profile = db.relationship("Profile", uselist=False, back_populates="user")

    def __repr__(self):
        return "<User(id='%s',email='%s')>" % (self.id, self.email)

    def __str__(self):
        if self.is_admin:
            return "!! %s %s (%s)" % (self.first_name, self.last_name, self.email)
        else:
            return "%s %s (%s)" % (self.first_name, self.last_name, self.email)

    def belongsTo(self,groupName):
        return groupName in [ x.name for x in self.groups]

    def serialize(self):
        obj = super(User,self).serialize()
        
        obj['first_name'] = self.profile.first_name
        obj['last_name'] = self.profile.last_name
        obj['email'] = self.email
        obj['password'] = self.password
        obj['groups'] = [ { key: group.serialize()[key] for key in ('id','name',) } for group in self.groups]

        return obj
