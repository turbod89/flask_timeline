import click
from flask import current_app, g

from .. import models

from flask.cli import with_appcontext

from werkzeug.security import check_password_hash, generate_password_hash

from PIL import Image as PIL_Image
import os



def generate(db):

    groups = [
        {'name':'admin', 'description': 'This is the group of admins. Full access to all data.'},
        {'name':'active', 'description': 'Active users. Only users in this group will exists at logic effects.'},
        {'name':'registered', 'description': 'Registered users which have not actived their account yet.'},
        {'name':'blocked', 'description': 'Blocked users. The only they can do is loggin.'},
    ]

    users = [
        {
            'first_name': 'admin',
            'last_name': '',
            'email': 'admin@example.com',
            'password': 'abc123',
            'groups': ['admin','active'],
            'avatar': 'data/chewaka.jpg'
        }
    ]

    for tGroup in groups:
        group = models.auth.Group(name=tGroup['name'], description = tGroup['description'])
        db.session.add(group)

    for tUser in users:
          user = models.auth.User(
              email = tUser['email'],
              password = generate_password_hash(tUser['password']),
          )
          user.profile = models.profile.Profile(
              first_name=tUser['first_name'],
              last_name=tUser['last_name'],
          )
          db.session.add(user)
    
    db.session.commit()

    for tUser in users:
        if 'avatar' in tUser:
            user = models.auth.User.query.filter_by(email=tUser['email']).first()
            image = PIL_Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)),tUser['avatar']))
            models.profile.setAvatarImage(user,image)
    
    db.session.commit()
    
    for tUser in users:
        user = models.auth.User.query.filter_by(email=tUser['email']).first()
        for sGroup in tUser['groups']:
            group = models.auth.Group.query.filter_by(name=sGroup).first()
            user.groups.append(group)
    
    db.session.commit()

def init_app(app,db):

    def reset_db():
        print ('Destroying database...')
        db.drop_all()
        print('Commiting...')
        db.session.commit()
        print('Creating all again...')
        db.create_all()
        print('Comminting...')
        db.session.commit()
        print('Generating auth module...')
        generate(db)


    @app.cli.command('reset-db')
    @with_appcontext
    def reset_db_command():
        """Clear the existing data and create new tables."""
        reset_db()
    app.cli.add_command(reset_db_command)