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