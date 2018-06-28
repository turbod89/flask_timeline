from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for

from .. import models

from . import chat

bp = Blueprint('sockets', __name__, url_prefix='/')
bp_api = Blueprint('api/sockets', __name__, url_prefix='/api/sockets')

chat.append(bp,bp_api)