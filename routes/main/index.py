from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models
def append(bp):
    @bp.route('/', methods=('GET', 'POST'))
    
    def index():
        
        if g.me is None:
            return render_template('main/home.html')
        else:
            return render_template('main/welcome.html', me = g.me)