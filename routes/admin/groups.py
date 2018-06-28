from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for,jsonify, abort
from werkzeug.security import check_password_hash, generate_password_hash

from ... import models
from .. import auth


def append(bp,bp_api):


    @bp.route('/groups', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.group_required('admin')
    @auth.notin_group_required('blocked')
    def groups():
        return render_template('admin/groups.html', me = g.me, groups = models.auth.Group.query.all())



    @bp_api.route('/groups', methods=('GET',))
    @auth.login_required
    @auth.group_required('active')
    @auth.group_required('admin')
    @auth.notin_group_required('blocked')
    def api_groups():
            
        groups = models.auth.Group.query.all()
        groups_json = [ group.serialize() for group in groups]
        return jsonify(groups_json)


    @bp_api.route('/group', methods=('POST',))
    @auth.login_required
    @auth.group_required('active')
    @auth.group_required('admin')
    @auth.notin_group_required('blocked')
    def api_post_group():
            
        name = request.form['name'] if 'name' in request.form else None
        description = request.form['description'] if 'description' in request.form else None
        errors = []

        if request.is_json:
            data = request.get_json()
            name = data['name'] or name
            description = data['description'] or description

        if not name:
            errors.append({
                'code': 1,
                'description': 'Name is required.',
            })
        else:
            group = models.auth.Group.query.filter_by(name = name).first()
            if group is not None:
                errors.append({
                    'code': 1,
                    'description': 'Group {} is already registered.'.format(name),
                })

        if len(errors) == 0:
            group = models.auth.Group(name=name, description=description)
            
            models.db.session.add(group)
            models.db.session.commit()

        return jsonify(errors)


    @bp_api.route('/group', methods=('DELETE',))
    @auth.login_required
    @auth.group_required('active')
    @auth.group_required('admin')
    @auth.notin_group_required('blocked')
    def api_delete_group():
            
        id = None if 'groupId' not in request.form else request.form['groupId']
        errors = []

        if request.is_json:
            data = request.get_json()
            id = id if 'groupId' not in data else data['groupId']

        if not id:
            errors.append({
                'code': 1,
                'description': 'Group id is required.',
            })
        else:
            group = models.auth.Group.query.filter_by(id = id).first()
            if group is None:
                errors.append({
                    'code': 1,
                    'description': 'Group with {} does not exists.'.format(name),
                })

            elif len(errors) == 0:
                
                models.db.session.delete(group)
                models.db.session.commit()

        return jsonify(errors)