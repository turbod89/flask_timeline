from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

from .. import models

from . import index

bp = Blueprint('main', __name__, url_prefix='/')

def page_not_found(e):
  return render_template('main/404.html'), 404

index.append(bp)