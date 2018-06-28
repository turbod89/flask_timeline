import functools

from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

from .. import models

from . import party

#from libgravatar import Gravatar

bp = Blueprint('parties', __name__, url_prefix='/parties')
bp_api = Blueprint('api/parties', __name__, url_prefix='/api/parties')

party.append(bp,bp_api)