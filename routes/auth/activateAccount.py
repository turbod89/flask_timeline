from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash

from flask_mail import Message,Mail

from ... import models

def append(bp,bp_api):

    

    @bp.route('/activateAccount/<string:token>', methods=('GET',))
    def activateAccount(token):
        user = models.auth.User.query.filter_by(activation_code = token).first_or_404()
        active = models.auth.Group.query.filter_by(name='active').first_or_404()
        
        user.groups = [active]
        models.db.session.commit()
        
        return render_template('auth/activateAccount.html')
