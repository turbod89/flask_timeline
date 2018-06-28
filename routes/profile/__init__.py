import functools

from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

from .. import models

from . import profile, avatar

#from libgravatar import Gravatar

bp = Blueprint('profile', __name__, url_prefix='/profile')
bp_api = Blueprint('api/profile', __name__, url_prefix='/api/profile')

profile.append(bp,bp_api)
avatar.append(bp,bp_api)