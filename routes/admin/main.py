from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for,jsonify, abort
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models
from .. import auth

def append(bp,bp_api):

    @bp.route('/', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.group_required('admin')
    @auth.notin_group_required('blocked')
    def main():
        return render_template('admin/main.html', me = g.me, groups = models.auth.Group.query.all())

