from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for,jsonify, abort
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models
from .. import auth

import math
import time
import hashlib


def append(bp,bp_api):

    @bp_api.route('/<int:user_id>', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def api_profile(user_id):
        user = models.auth.User.query.filter_by(id = user_id).first_or_404()
        user_serialized = user.serialize()
        user_serialized['profile'] = user.profile.serialize()
        user_serialized['profile']['avatar'] = url_for('profile.avatar',user_id=user_id)
        return jsonify(user_serialized)

    @bp_api.route('/', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def api_own_profile():
        return redirect(url_for('api/profile.api_profile', user_id=g.me.id))

    @bp.route('/<int:user_id>', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def profile(user_id):
        if user_id == g.me.id:
            return redirect(url_for('profile.own_profile'))

        user = models.auth.User.query.filter_by(id = user_id).first_or_404()
        return render_template('profile/profile.html', me = g.me, user = user)

    @bp.route('/', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def own_profile():
        return render_template('profile/own_profile.html', me = g.me)


