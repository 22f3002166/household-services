from flask_security import UserMixin, RoleMixin
from datetime import datetime
from .database import db

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String)
    pincode = db.Column(db.String)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    service_provider_experience = db.Column(db.Integer)
    service_name = db.Column(db.String)
    cv = db.Column(db.String)
    isVerified = db.Column(db.Boolean, default=False)
    
    
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)
    active = db.Column(db.Boolean, default=True)

    roles = db.relationship('Role', secondary='user_role', backref=db.backref('users', lazy='dynamic'))
    service_requests = db.relationship('ServiceRequest', backref='customer', lazy=True)
    services = db.relationship('Services', backref='provider', lazy=True)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String)

class UserRole(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class Services(db.Model):
    __tablename__ = "services"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    base_price = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class ServiceRequest(db.Model):
    __tablename__ = "service_request"
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    service_provider_id = db.Column(db.Integer, nullable=True)
    date_of_register = db.Column(db.DateTime, index=True, default=datetime.utcnow, nullable=False)
    date_of_completion = db.Column(db.DateTime)
    service_status = db.Column(db.String, default="Pending")
    remarks = db.Column(db.String)
    is_active_request = db.Column(db.Boolean, default=True)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_request_id = db.Column(db.Integer, db.ForeignKey('service_request.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    service_provider_id = db.Column(db.Integer)  
    contact_number = db.Column(db.Integer)  
    rating = db.Column(db.Integer)
    review_description = db.Column(db.String)
    
    review = db.relationship("ServiceRequest", backref="reviews") 