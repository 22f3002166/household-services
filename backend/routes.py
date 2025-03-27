from flask import current_app as app, jsonify
from flask_security import auth_required, roles_required, current_user

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
    
@app.route('/api/ service_professional')
@auth_required('token')
@roles_required('service_professional')
def service_professional():
    user = current_user
    return jsonify({
        "username": user.name,
        "email": user.email,
        "password": user.password
    })