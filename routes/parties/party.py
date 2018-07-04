from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for,jsonify, abort
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models
from .. import auth

import math
import time
import hashlib

def append(bp,bp_api):

    @bp.route('/<string:token>', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def party(token):
        return render_template('party/party.html', me = g.me, token = token)

    @bp.route('/', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def parties():
        return render_template('party/parties.html', me=g.me)

    @bp_api.route('/', methods=('GET','POST',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def api_parties():

        if request.method == 'GET':
            parties = models.party.Party.query.filter(models.party.Party.status.in_(('created','started',))).all()
            parties_json = [party.serialize() for party in parties]

            for party_dict in parties_json:
                party_dict['url'] = url_for('parties.party',token = party_dict['code'])
            
            return jsonify(parties_json)


        elif request.method == 'POST':
            name = request.form['name'] if 'name' in request.form else None
            error = None

            if request.is_json:
                data = request.get_json()
                name = data['name'] or name

            if error is None:
                party = models.party.Party(name=name,status='created')
                party.owner = g.me
                party.participants = [g.me]
                models.db.session.add(party)
                models.db.session.commit()
            
            return jsonify(party.serialize())

    @bp_api.route('/join/<string:token>', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def api_party_join(token):

        party = models.party.Party.query.filter_by(code=token).first()
        
        if party is None:
            return jsonify({ 'errors': [{'description': 'No party was found'}], 'data': []})
        
        party_serialized = party.serialize()
        
        if party.status != 'created':
            return jsonify({ 'errors': [{'description': 'Party was already started'}], 'data': party_serialized})
        
        if len(party.participants) >= 4:
            return jsonify({ 'errors': [{'description': 'Party already has the maximum allowed participants'}], 'data': party_serialized})
        
        user = next( (user for user in party.participants if user.id == g.me.id), None)

        if user is not None:
            return jsonify({ 'errors': [{'description': 'Already in'}], 'data': party_serialized})

        party.participants.append(g.me)
        models.db.session.commit()
        party_serialized = party.serialize()


        return jsonify({ 'errors': [], 'data': party_serialized})

    @bp_api.route('/leave/<string:token>', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def api_party_leave(token):

        party = models.party.Party.query.filter_by(code=token).first()
        
        if party is None:
            return jsonify({ 'errors': [{'description': 'No party was found'}], 'data': []})
        
        party_serialized = party.serialize()
        
        if party.status != 'created':
            return jsonify({ 'errors': [{'description': 'Party was already started'}], 'data': party_serialized})
        
        if len(party.participants) <= 0:
            return jsonify({ 'errors': [{'description': 'Party cannot be empty!'}], 'data': party_serialized})
        
        user = next( (user for user in party.participants if user.id == g.me.id), None)

        if user is None:
            return jsonify({ 'errors': [{'description': 'User already was out'}], 'data': party_serialized})

        if party.owner.id == user.id:
            return jsonify({ 'errors': [{'description': 'Owner cannot leave the party'}], 'data': party_serialized})

        party.participants.remove(user)
        models.db.session.commit()
        party_serialized = party.serialize()


        return jsonify({ 'errors': [], 'data': party_serialized})


    @bp.route('/create', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def create_party():
        return render_template('party/create.html', me=g.me)
    
