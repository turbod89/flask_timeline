from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for,jsonify
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models

def append(bp,bp_api):

    def logic():
        session.clear()
        return None

    @bp.route('/logout')
    def logout():
        logic()
        return redirect(url_for('index'))

    @bp_api.route('/logout')
    def api_logout():
        logic()
        return jsonify({'errors': []})

