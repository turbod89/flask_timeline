from ..Base import Base, db
from sqlalchemy.sql import func
from .. import main


class Avatar(main.Image):
    __tablename__ = 'avatars'

    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'))
    profile = db.relationship("Profile", back_populates="avatar")
    
    token = db.Column('token',db.String(128),nullable = False)

    def __repr__(self):
        return "<Avatar(id='%s',fd='%s')>" % (self.id, self.file_mime)

    def __str__(self):
        return "%s" % (self.id, )

    def serialize(self):
        obj = super(Avatar,self).serialize()
        obj['token'] = self.token
        
        return obj
