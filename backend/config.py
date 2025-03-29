class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True 
    
class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///hsdb.sqlite3'
    DEBUG = True
    
    SECRET_KEY = "This-is-a-secret-key"
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "This-is-a-password-salt"
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authorization'
    
    SECURITY_TOKEN_MAX_AGE = 3600