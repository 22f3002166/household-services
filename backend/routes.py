from flask import current_app as app, jsonify, request
from database import db
from flask_security import auth_required, roles_required, current_user, hash_password

@app.route('/', methods=['GET'])
def home():
    return "<h1>Home Page</h1>"



@app.route('/api/admin')
@auth_required('token')
@roles_required('admin')
def admin():
    return "<h1>Admin Page</h1>"

@app.route('/api/customer')
@auth_required('token')
@roles_required('customer')
def customer():
    user = current_user
    return jsonify({
        "username": user.name,
        "email": user.email,
        "password": user.password
    })
    
@app.route('/api/service_professional')
@auth_required('token')
@roles_required('service_professional')
def service_professional():
    user = current_user
    return jsonify({
        "username": user.name,
        "email": user.email,
        "password": user.password
    })
    
@app.route('/api/register_customer', methods=['POST'])
def register_customer():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials['email']):
        app.security.datastore.create_user( email = credentials['email'], name = credentials['name'], password = hash_password(credentials['password']), roles = ['customer'])
        db.session.commit()
        return jsonify({"message": "User registered successfully"})
    return jsonify({"message": "User already exists"})
        
        
    
    
@app.route('/api/register_service_professional', methods=['POST'])
def register_service_professional():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials['email']):
        app.security.datastore.create_user( email = credentials['email'], name = credentials['name'], password = hash_password(credentials['password']), roles = ['service_professional'])
        db.session.commit()
        return jsonify({"message": "User registered successfully"})
    return jsonify({"message": "User already exists"})
        
