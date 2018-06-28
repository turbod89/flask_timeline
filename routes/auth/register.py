from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models

def append(bp,bp_api):

    def logic():
        email = request.form['email'] if 'email' in request.form else None
        password = request.form['password'] if 'password' in request.form else None
        first_name = request.form['first_name'] if 'first_name' in request.form else None
        last_name = request.form['last_name'] if 'last_name' in request.form else None
        error = None

        if request.is_json:
            data = request.get_json()
            email = data['email'] or email
            password = data['password'] or password
            first_name = data['first_name'] or first_name
            last_name = data['last_name'] or last_name

        if not email:
            error = 'Email is required.'
        elif not password:
            error = 'Password is required.'
        else:
            user = models.auth.User.query.filter_by(email = email).first()
            if user is not None:
                error = 'User {} is already registered.'.format(email)

        if error is None:
            user = models.auth.User(email=email, password = generate_password_hash(password))
            user.profile = models.profile.Profile(first_name = first_name, last_name=last_name)
            group = models.auth.Group.query.filter_by(name='registered').first()
            user.groups.append(group)
            models.db.session.add(user)
            models.db.session.commit()

            session.clear()
            session['user_id'] = user.id
            session['logged_in'] = True

        return error


    @bp.route('/register', methods=('GET', 'POST'))
    def register():
        if request.method == 'POST':
            error = logic()
            if error is not None:
                return redirect(url_for('index'))

            flash(error)

        return render_template('auth/register.html')



    @bp_api.route('/register', methods=('POST',))
    def api_register():
        error = logic()
        if error is not None:
            return jsonify({'errors': [{'description': error}]})


        return jsonify({'errors': []})
