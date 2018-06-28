from ..Base import Base, db
from sqlalchemy.sql import func

class Profile(Base):
    __tablename__ = 'profiles'

    first_name = db.Column('first_name', db.String(32), nullable = True)
    last_name = db.Column('last_name', db.String(32), nullable = True)
    birth_date = db.Column('birth_date', db.DateTime, nullable = True)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user = db.relationship("User", back_populates="profile")

    avatar = db.relationship("Avatar", uselist=False, back_populates="profile")


    def __repr__(self):
        return "<Profile(id='%s')>" % (self.id, )

    def __str__(self):
        return "%s %s" % (self.first_name, self.last_name)

    def serialize(self):
        obj = super(Profile,self).serialize()
        
        obj['first_name'] = self.first_name
        obj['last_name'] = self.last_name
        obj['birth_date'] = None if self.birth_date is None else self.birth_date.isoformat()
        
        return obj
