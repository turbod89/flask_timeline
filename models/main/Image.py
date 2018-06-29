from ..Base import Base, db
from sqlalchemy.sql import func

from flask import current_app

import re
import os
import math
import base64
from io import BytesIO
from PIL import Image as PIL_Image
import time


class Image(Base):
    __abstract__ = True

    file_descriptor = db.Column('file_descriptor', db.String(128), nullable = False)
    file_mime = db.Column('file_mime', db.String(32), nullable = False)

    def __repr__(self):
        return "<Image(id='%s',fd='%s')>" % (self.id, self.file_mime)

    def __str__(self):
        return "%s" % (self.id, )

    def serialize(self):
        obj = super(Image,self).serialize()
        
        obj['file_descriptor'] = self.file_descriptor
        obj['file_mime'] = self.file_mime
        
        return obj

    @staticmethod
    def save(image, filename = None, max_width = None, max_height = None):
        
        directory = os.path.join(current_app.config['UPLOADED_FILES_DEST'])
        try:
            os.stat(directory)
        except:
            os.mkdir(directory)
        
        if filename is None:
            filename = 'image_'+str(math.floor(1000*time.time()))

        file_descriptor = os.path.join(directory, filename)
        file_mime = image.format

        if file_mime == 'PNG':
            file_descriptor = file_descriptor + '.png'
        elif file_mime == 'JPEG':
            file_descriptor = file_descriptor + '.jpg'
                

        #
        #   convent to jpg
        #

        if file_mime == 'PNG':
            #re-convert to jpeg
            image = image.convert('RGB')
            file_descriptor = re.sub(r'\.png$', '.jpg', file_descriptor)
            file_mime = 'JPEG'
        
        
        width, height = image.size

        
        if max_width is not None and width > max_width:
            if file_mime == 'PNG':
                #re-convert to jpeg
                image = image.convert('RGB')
                file_descriptor = re.sub(r'\.png$','.jpg',file_descriptor)
                file_mime = 'JPEG'

            height = math.floor(height*max_width/width)
            width = max_width
            image = image.resize((width, height), PIL_Image.ANTIALIAS)

        if max_height is not None and height > max_height:
            if file_mime == 'PNG':
                #re-convert to jpeg
                image = image.convert('RGB')
                file_descriptor = re.sub(r'\.png$', '.jpg', file_descriptor)
                file_mime = 'JPEG'

            width = math.floor(width*max_height/height)
            height = max_height
            image = image.resize((width, height), PIL_Image.ANTIALIAS)


        if file_mime == 'PNG':
            image.save(file_descriptor)
        elif file_mime == 'JPEG':
            image.save(file_descriptor, optimize=True, quality=95)
        else:
            print('File mimetype = %s unknown' % (file_mime,))

        return file_descriptor, file_mime


    @staticmethod
    def save_from_urlData(data, filename = None, max_width = None, max_height = None):

        r = re.compile('data:(.+);base64,')
        match = re.search(r, data)
        file_mime = match.group(1)

        image_data = bytes(re.sub(r, '', data), encoding='ascii')

        image = PIL_Image.open(BytesIO(base64.b64decode(image_data)))
        return Image.save(image,filename, max_width,max_height)
        

        
