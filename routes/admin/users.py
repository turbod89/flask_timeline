from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for,jsonify, abort
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models
from .. import auth


def append(bp,bp_api):


    @bp.route('/users', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.group_required('admin')
    @auth.notin_group_required('blocked')
    def users():
        return render_template('admin/users.html', me = g.me, groups = models.auth.Group.query.all())



    @bp_api.route('/users', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.group_required('admin')
    @auth.notin_group_required('blocked')
    def api_users():
        users = models.auth.User.query.all()
        users_json = [ user.serialize() for user in users]
        return jsonify(users_json)
