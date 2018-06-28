from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for,jsonify
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models


def append(bp,bp_api):

    def parse():
        error = None

        email = ''
        password = ''

        if 'email' in request.form:
            email = request.form['email']
        if 'password' in request.form:
            password = request.form['password']
        
        user = models.auth.User.query.filter_by(email = email).first()
            

        if user is None:
            error = 'Incorrect email.'
        elif not check_password_hash(user.password, password):
            error = 'Incorrect password.'

        if error is None:
            session.clear()
            session['user_id'] = user.id
            session['logged_in'] = True
        
        return error


    @bp.route('/login', methods=('GET', 'POST'))
    def login():
        if request.method == 'POST':
            error = parse()
            if error is None:
                return redirect(url_for('index'))
                
            flash(error)
            

        return render_template('auth/login.html')

    @bp_api.route('/login', methods=('POST',))
    def api_login():
        error = parse()

        if error is not None:
            return jsonify({'errors': [{'description': error}]})


        return jsonify({'errors': []})

