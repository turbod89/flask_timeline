from ..Base import Base
from ..db import db

from .Avatar import Avatar
from .Profile import Profile
from ..main import Image


from flask.cli import with_appcontext

import math, time, hashlib
from PIL import Image as PIL_Image

def setAvatarImage(user, image):
    filename = 'avatar_'+str(user.id)+'_'+str(math.floor(1000*time.time()))
    m = hashlib.md5()
    m.update(str(math.floor(1000*time.time())).encode('utf-8'))
    token = m.hexdigest()
    file_descriptor, file_mime = Image.save( image,filename, max_width=512,max_height=512)

    img = PIL_Image.open(file_descriptor)
    w,h = img.size

    #print ('%s %s has width = %i and height = %i' % (file_descriptor, file_mime,w,h,))

    # if exists, replace previous avatar
    oldAvatar = user.profile.avatar
    if oldAvatar is not None:
        oldAvatar.profile = None

    avatar = Avatar(
        file_descriptor = file_descriptor,
        file_mime = file_mime,
        token = token,
        profile = user.profile
    )

    db.session.add(avatar)
    db.session.commit()


def setAvatarImageFromUrlData(user, imageData):
    
    filename = 'avatar_'+str(user.id)+'_'+str(math.floor(1000*time.time()))
    m = hashlib.md5()
    m.update(str(math.floor(1000*time.time())).encode('utf-8'))
    token = m.hexdigest()
    file_descriptor, file_mime = Image.save_from_urlData( imageData,filename, max_width=512,max_height=512)

    img = PIL_Image.open(file_descriptor)
    w,h = img.size

    #print ('%s %s has width = %i and height = %i' % (file_descriptor, file_mime,w,h,))

    # if exists, replace previous avatar
    oldAvatar = user.profile.avatar
    if oldAvatar is not None:
        oldAvatar.profile = None

    avatar = Avatar(
        file_descriptor = file_descriptor,
        file_mime = file_mime,
        token = token,
        profile = user.profile
    )

    db.session.add(avatar)
    db.session.commit()

def init_app(app,db):
    print('models/profile/__init__.py init_app(app)')