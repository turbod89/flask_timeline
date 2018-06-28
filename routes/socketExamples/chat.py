from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for

from .. import auth
from ... import models

def append(bp,bp_api):

    @bp.route('/chat', methods=('GET', 'POST'))
    @auth.login_required
    @auth.group_required('active')
    @auth.notin_group_required('blocked')
    def chat():
        return render_template('socketExamples/chat.html', me = g.me)