import datetime
import os

class Configuration():
    
    def __init__(self,config):

        host = None
        port = None
        user = None
        password = None
        database = None

        # configure your settings here
        if config == 'dev':
            host = 'localhost'
            port = '3306'
            user = 'username'
            password = 'mypassword'
            database = 'mydatabase'
        elif config == 'test':
            host = 'localhost'
            port = '3306'
            user = 'username'
            password = 'mypassword'
            database = 'mydatabase'
        elif config == 'prod':
            host = 'localhost'
            port = '3306'
            user = 'username'
            password = 'mypassword'
            database = 'mydatabase'
        else:
            host = 'localhost'
            port = '3306'
            user = 'username'
            password = 'mypassword'
            database = 'mydatabase'
        
        # global configurations

        self.DATABASE_URI = 'mysql+mysqlconnector://%s:%s@%s:%s/%s' % (user, password, host, str(port), database)
        self.SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://%s:%s@%s:%s/%s' % (user, password, host, str(port), database)
        self.SQLALCHEMY_TRACK_MODIFICATIONS = False
        self.SECRET_KEY = 'mysecretkey'
        
        self.SESSION_REFRESH_EACH_REQUEST = True
        self.PERMANENT_SESSION_LIFETIME = datetime.timedelta(31)
        
        self.SESSION_COOKIE_SECURE = False
        self.SESSION_COOKIE_HTTPONLY = True
        self.SESSION_COOKIE_NAME = 'session'
        #self.SESSION_COOKIE_SAMESITE = None
        #self.SESSION_COOKIE_PATH = None
        
        self.MAX_COOKIE_SIZE = 4093
        
        self.APPLICATION_ROOT = '/'
        #self.SERVER_NAME = None
        
        #self.PROPAGATE_EXCEPTIONS = None
        #self.PRESERVE_CONTEXT_ON_EXCEPTION = None
        self.TRAP_HTTP_EXCEPTIONS = False
        #self.TRAP_BAD_REQUEST_ERRORS = None
        
        #self.MAX_CONTENT_LENGTH = None
        self.SEND_FILE_MAX_AGE_DEFAULT = datetime.timedelta(0,43200)
        self.USE_X_SENDFILE = False
        self.PREFERRED_URL_SCHEME = 'http'
        
        self.JSON_AS_ASCII = True
        self.JSONIFY_PRETTYPRINT_REGULAR = False
        self.JSONIFY_MIMETYPE = 'application/json'
        self.JSON_SORT_KEYS = True
        
        self.EXPLAIN_TEMPLATE_LOADING = False
        #self.TEMPLATES_AUTO_RELOAD = None

        self.FLASK_RUN_CERT = 'certs/dev.crt'
        self.FLASK_RUN_KEY = 'certs/dev.key'
        self.HTTPS_REQUIRED = False

        self.UPLOADED_FILES_DEST = '/var/uploads'
        
        self.CONFIGURATION_NAME = config
