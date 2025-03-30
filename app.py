from flask import Flask
from backend.database import db
from backend.models import User, Role, UserRole, Services, ServiceRequest, Review
from backend.resources import *
from backend.config import *
from backend.celery.celery_factory import celery_init_app
from flask_security import Security, SQLAlchemyUserDatastore
from flask_security import hash_password
from flask_caching import Cache
import flask_excel as excel



def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    
    cache = Cache(app)
    
    
    from backend.resources import api
    api.init_app(app)
    
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.cache = cache
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()

with app.app_context():
    db.create_all()
    
    app.security.datastore.find_or_create_role(name='admin', description='Administrator')
    app.security.datastore.find_or_create_role(name='customer', description='Customer')
    app.security.datastore.find_or_create_role(name='service_professional', description='Service Professional')
    db.session.commit()
    
    if not app.security.datastore.find_user(email = "user@admin.com"):
        app.security.datastore.create_user( email = "user@admin.com", name = "admin", password = hash_password("1234"), roles = ['admin'])
        
    if not app.security.datastore.find_user(email = "user@cm.com"):
        app.security.datastore.create_user( email = "user@cm.com", name = "customer", password = hash_password("1234"), roles = ['customer'])
        
    if not app.security.datastore.find_user(email = "user@sp.com"):
        app.security.datastore.create_user( email = "user@sp.com", name = "Service_Professional", password = hash_password("1234"), roles = ['service_professional'])
    
    db.session.commit()
from backend.routes import *
celery_app = celery_init_app(app)

excel.init_excel(app)

if __name__ == "__main__":
    
    app.run()
    
    
