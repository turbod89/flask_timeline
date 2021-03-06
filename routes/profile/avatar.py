from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for,jsonify, abort, send_file, current_app
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models
from .. import auth

import math, time, hashlib
from PIL import Image as PIL_Image

def append(bp,bp_api):

    @bp.route('/avatar/<int:user_id>', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def avatar(user_id):
        user = models.auth.User.query.filter_by(id = user_id).first_or_404()
        if user.profile is None or user.profile.avatar is None:
            return send_file('data/avatars/default-avatar.png', mimetype='image/png')
        
        avatar = user.profile.avatar
        return send_file(avatar.file_descriptor, mimetype= avatar.file_mime)

    @bp.route('/avatar', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def own_avatar():
        return avatar(user_id=g.me.id)
    
    @bp.route('/avatar/<string:token>', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def own_avatar_token(token):
        #
        # do something with the token
        return avatar(user_id = g.me.id)


    @bp_api.route('/avatar', methods=('POST',))
    @auth.login_required
    @auth.notin_group_required('blocked')
    def post_own_avatar():
        if not request.is_json:
            return jsonify({'errors': [{'description': 'Data should be pase as json'}]})

        data = request.get_json()
        if data['image'] is None:
            return jsonify({'errors': [{'description': '\'image\' field not provided'}]})

        models.profile.setAvatarImageFromUrlData(g.me,data['image'])

        return jsonify({'errors':[]})
        
