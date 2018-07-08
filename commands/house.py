import click
from flask import current_app, g

from .. import models

from flask.cli import with_appcontext

from werkzeug.security import check_password_hash, generate_password_hash

from PIL import Image as PIL_Image
import os
import random



def generate(app,db):

    users = [
        {
            'first_name': 'Gregory',
            'last_name': 'House',
            'email': 'ghouse@example.com',
            'password': 'abc123',
            'groups': ['active'],
            'avatar': 'data/gregory_house.png',
        },
        {
            'first_name': 'James',
            'last_name': 'Wilson',
            'email': 'jwilson@example.com',
            'password': 'abc123',
            'groups': ['active'],
            'avatar': 'data/james_wilson.jpg',
        },
        {
            'first_name': 'Lisa',
            'last_name': 'Cuddy',
            'email': 'lcuddy@example.com',
            'password': 'abc123',
            'groups': ['admin','active'],
            'avatar': 'data/lisa_cuddy.jpg',
        },
        {
            'first_name': 'Allison',
            'last_name': 'Cameron',
            'email': 'acameron@example.com',
            'password': 'abc123',
            'groups': ['active'],
            'avatar': 'data/allison-cameron.png'
        },
        {
            'first_name': 'Eric',
            'last_name': 'Foremant',
            'email': 'eforeman@example.com',
            'password': 'abc123',
            'groups': ['active'],
            'avatar': 'data/eric_foreman.jpg',
        },
        {
            'first_name': 'Rober',
            'last_name': 'Chase',
            'email': 'rchase@example.com',
            'password': 'abc123',
            'groups': ['active'],
            'avatar': 'data/rober_chase.jpg'
        },
    ]

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

    users = models.auth.User.query.all()
    for i in range(0,12):
        party = models.party.Party()
        num_players = random.randint(2,4)
        status = 'created' if random.random() > 0.3 else (
            'started' if random.random() > 0.3 else 'finished')
        players = random.sample(users,num_players)
        owner = random.sample(players,1)[0]
        name  = '%s\'s party #%i' % (owner.profile.first_name, i+1)
        deck = models.party.Deck.query.filter_by(name='proof').first()


        party.status = status
        party.participants = players
        party.owner = owner
        party.name = name
        party.deck = deck

        db.session.add(party)
    db.session.commit()



def init_app(app,db):

    @app.cli.command('dataset-house')
    @with_appcontext
    def reset_db_command():
        """Spawn users based on HOUSE tv serie"""
        generate(app,db)
    app.cli.add_command(reset_db_command)
