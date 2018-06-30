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

    @bp_api.route('/', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def api_parties():
        parties = models.party.Party.query.filter(models.party.Party.status.in_(('created','started',))).all()
        parties_json = [party.serialize() for party in parties]

        for party_dict in parties_json:
            party_dict['url'] = url_for('parties.party',token = party_dict['code'])
        
        return jsonify(parties_json)

    @bp.route('/create', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def create_party():
        return render_template('party/create.html', me=g.me)


    
