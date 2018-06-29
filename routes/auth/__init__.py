import functools

from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for,abort
from werkzeug.security import check_password_hash, generate_password_hash

from .. import models

from . import register,login,logout, activateAccount, setInGroup

#from libgravatar import Gravatar

bp = Blueprint('auth', __name__, url_prefix='/auth')
bp_api = Blueprint('api/auth', __name__, url_prefix='/api/auth')

def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.me = None
        session['logged_in'] = False
    else:
        g.me = models.auth.User.query.filter_by(id = user_id).first()
        session['logged_in'] = g.me is not None
        #g.gravatar = Gravatar(g.me.email)

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.me is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view

def group_required(groupName):
    def _group_required(view):
        @functools.wraps(view)
        def wrapped_view(**kwargs):
            if g.me is None:
                return redirect(url_for('auth.login'))
            elif not g.me.belongsTo(groupName):
                return abort(404)

            return view(**kwargs)

        return wrapped_view
    return _group_required

def notin_group_required(groupName):
    def _group_required(view):
        @functools.wraps(view)
        def wrapped_view(**kwargs):
            if g.me is None:
                return redirect(url_for('auth.login'))
            elif g.me.belongsTo(groupName):
                return abort(404)

            return view(**kwargs)

        return wrapped_view
    return _group_required

register.append(bp,bp_api)
login.append(bp,bp_api)
logout.append(bp,bp_api)
activateAccount.append(bp,bp_api)
setInGroup.append(bp,bp_api)
