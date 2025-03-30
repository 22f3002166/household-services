from flask import current_app as app, jsonify, request, render_template
from .models import *
import uuid
from .database import db
from datetime import datetime
from flask_security import auth_required, roles_required, current_user, hash_password , roles_accepted, login_user
from flask_security.utils import verify_password
from .celery.tasks import add, create_csv
from celery.result import AsyncResult



cache = app.cache


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')


@app.route('/cache', methods=['GET'])
@cache.cached(timeout=5)
def cache():
    return {'time': datetime.utcnow()}

@app.route('/celery', methods=['GET'])
def celery():
    result = add.delay(1, 2)
    return jsonify({'task_id': result.id})

@app.route('/createcsv', methods=['GET'])
def createcsv():
    task = create_csv.delay()
    return jsonify({'task_id': task.id})

@app.route('/celerydata/<id>', methods=['GET'])
def celerydata(id):
    result = add.AsyncResult(id)
    return jsonify({'status': result.status, 'result': result.result})




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
        "password": user.password,
        "service_provider_experience": user.service_provider_experience
    })
    
@app.route('/api/register_customer', methods=['POST'])
def register_customer():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials['email']):
        app.security.datastore.create_user( email = credentials['email'], name = credentials['name'], password = hash_password(credentials['password']), roles = ['customer'])
        db.session.commit()
        return jsonify({"message": "User registered successfully"})
    return jsonify({"message": "User already exists"})
        
        

@app.route('/api/get_unassigned_services', methods=['GET'])
def get_unassigned_services():
    unassigned_services = Services.query.filter_by(user_id=None).all()
    service_list = [{"id": service.id, "name": service.name} for service in unassigned_services]
    return jsonify(service_list)
        
    
    
@app.route('/api/register_service_professional', methods=['POST'])
def register_service_professional():
    credentials = request.get_json()

    role_name = 'service_professional'
    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({'message': 'Role not found'}), 400

    if app.security.datastore.find_user(email=credentials['email']):
        return jsonify({"message": "User already exists"}), 409  


    selected_service = Services.query.filter_by(name=credentials.get('service_name'), user_id=None).first()
    if not selected_service:
        return jsonify({"message": "Invalid or already assigned service"}), 400


    new_user = app.security.datastore.create_user(
        email=credentials['email'],
        name=credentials['name'],
        password=hash_password(credentials['password']),
        active=False, 
        service_provider_experience=credentials.get('service_provider_experience'),
        service_name=credentials.get('service_name')
    )

    db.session.flush() 

 
    selected_service.user_id = new_user.id

    app.security.datastore.add_role_to_user(new_user, role)
    db.session.commit()

    return jsonify({"message": "Service Professional registered successfully", "service_assigned": selected_service.name}), 201



@app.route('/api/login', methods=['POST'])
def login():
    credentials = request.get_json()

    if not credentials or 'email' not in credentials or 'password' not in credentials:
        return jsonify({'message': 'Missing email or password'}), 400

    user = app.security.datastore.find_user(email=credentials['email'])

    if not user:
        return jsonify({'message': 'Email not registered'}), 404

    if not verify_password(credentials['password'], user.password):
        return jsonify({'message': 'Incorrect password'}), 401

    if not user.active:
        return jsonify({'message': 'User is inactive, contact admin'}), 403
    
    login_user(user)

    role = user.roles[0].name if user.roles else 'customer'


    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": role,
        "auth-token": user.get_auth_token()
        
    }

    if role == "service_professional":
        user_data["service_provider_experience"] = user.service_provider_experience

    return jsonify({
        'message': 'Login successful',
        'user': user_data
    }), 200

@app.route('/api/update_customer', methods=['PUT'])
@auth_required('token')
@roles_required('customer')
def update_customer():
    data = request.get_json()
    user = current_user  
    allowed_fields = ['name', 'password']
    
  
    if not any(field in data for field in allowed_fields):
        return jsonify({"message": "No valid fields to update"}), 400

    try:
        if 'name' in data:
            user.name = data['name']

        if 'password' in data:
            user.password = hash_password(data['password']) 

        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200  

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Profile update failed", "error": str(e)}), 500  
    
@app.route('/api/update_service_professional', methods=['PUT'])
@auth_required('token')
@roles_required('service_professional')
def update_service_professional():
    data = request.get_json()
    user = current_user
    allowed_fields = ['name', 'password', 'service_provider_experience']
    
    if not any(field in data for field in allowed_fields):
        return jsonify({"message": "No valid fields to update"}), 400
    
    try:
        if 'name' in data:
            user.name = data['name']

        if 'password' in data:
            user.password = hash_password(data['password'])

        if 'service_provider_experience' in data:
            user.service_provider_experience = data['service_provider_experience']

        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Profile update failed", "error": str(e)}), 500


@app.route('/api/customer/create_service_request', methods=['POST'])
@auth_required('token')
@roles_required('customer')
def create_service_request():
    data = request.get_json()
    print("Received data:", data)  

    user_id = current_user.id
    service_id = data.get('service_id')
    service_provider_id = data.get('service_provider_id')

    if not user_id or not service_id or not service_provider_id:
        return jsonify({'message': 'Missing required fields', 'received_data': data}), 400


    service = Services.query.get(service_id)
    if not service:
        return jsonify({'message': 'Invalid service_id'}), 400


    if service.user_id != service_provider_id:
        return jsonify({'message': 'Invalid service provider for this service'}), 400

 
    existing_request = ServiceRequest.query.filter_by(user_id=user_id, service_id=service_id).first()
    if existing_request:
        return jsonify({'message': 'You have already requested this service'}), 400

  
    new_request = ServiceRequest(
        user_id=user_id,
        service_id=service_id,
        service_provider_id=service_provider_id,
        service_status='pending'
    )
    db.session.add(new_request)
    
    try:
        db.session.commit()
        return jsonify({'message': 'Service request created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Service request failed', 'error': str(e)}), 500

    

    
@app.route('/api/customer/update_service_request/<int:request_id>', methods=['PUT'])
@auth_required('token')
@roles_required('customer')
def update_service_request(request_id):
    try:
        data = request.get_json()
        service_request = ServiceRequest.query.get(request_id)


        if not service_request:
            return jsonify({'message': 'Service request not found'}), 404

        if service_request.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized to update this service request'}), 403

        if 'date_of_register' in data:
            service_request.date_of_register = data['date_of_register']
        
        if 'service_status' in data:
            
            service_request.service_status = data['service_status']
            if data['service_status'].lower() == "completed":
                service_request.date_of_completion = datetime.utcnow()
        if 'remarks' in data:
            service_request.remarks = data['remarks']

        db.session.commit()
        return jsonify({'message': 'Service request updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update service request', 'error': str(e)}), 500

@app.route('/api/service_requests', methods=['GET'])
@auth_required('token')
@roles_accepted('admin', 'customer', 'service_professional')
def get_service_requests():
    try:
      
        user_roles = [role.name for role in current_user.roles]

        if 'admin' in user_roles:
         
            service_requests = ServiceRequest.query.all()
        elif 'customer' in user_roles:
          
            service_requests = ServiceRequest.query.filter_by(user_id=current_user.id).all()
        elif 'service_professional' in user_roles:
     
            service_requests = ServiceRequest.query.filter_by(service_provider_id=current_user.id).all()
        else:
            return jsonify({'message': 'Unauthorized role'}), 403

        result = []
        for request in service_requests:
            user = User.query.get(request.user_id) 
            provider = User.query.get(request.service_provider_id) 
            result.append({
                'id': request.id,
                'service_id': request.service_id,
                'user_email': user.email,
                'service_provider_email': provider.email,
                'service_status': request.service_status,
                'date_of_register': request.date_of_register,
                'date_of_completion': request.date_of_completion,
                'remarks': request.remarks
            })

        return jsonify({'service_requests': result}), 200

    except Exception as e:
        return jsonify({'message': 'Error retrieving service requests', 'error': str(e)}), 500
    
    
    
@app.route('/api/customer/summary', methods=['GET'])
@auth_required('token')
@roles_required('customer')
def get_customer_summary():
    try:
        user_id = current_user.id

        total_requests = ServiceRequest.query.filter_by(user_id=user_id).count()
        requests_in_progress = ServiceRequest.query.filter_by(user_id=user_id, service_status='in progress').count()
        completed_requests = ServiceRequest.query.filter_by(user_id=user_id, service_status='completed').count()
        pending_requests = ServiceRequest.query.filter_by(user_id=user_id, service_status='pending').count()
        closed_requests = ServiceRequest.query.filter_by(user_id=user_id, service_status='rejected').count()

        return jsonify({
            'totalRequests': total_requests,
            'requestsInProgress': requests_in_progress,
            'completedRequests': completed_requests,
            'pendingRequests': pending_requests,
            'closedRequests': closed_requests
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to fetch customer summary', 'error': str(e)}), 500

    
@app.route('/api/customer/rate_service', methods=['POST'])
@auth_required('token')
@roles_required('customer')
def rate_service():
    data = request.get_json()
    
    service_request_id = data.get('service_request_id')
    rating = data.get('rating')
    review_description = data.get('review')

    if not service_request_id or rating is None or not review_description:
        return jsonify({'message': 'Missing required fields'}), 400  

    if not (1 <= rating <= 5):
        return jsonify({'message': 'Rating must be between 1 and 5'}), 400

    user = current_user  

    service_request = ServiceRequest.query.filter_by(id=service_request_id, user_id=user.id).first()
    if not service_request:
        return jsonify({'message': 'Invalid service request or not authorized'}), 400 

    if not service_request.date_of_completion:
        return jsonify({'message': 'Cannot rate an incomplete service'}), 400

    existing_review = Review.query.filter_by(service_request_id=service_request_id, customer_id=user.id).first()
    if existing_review:
        return jsonify({'message': 'You have already rated this service'}), 400 

    service_review = Review(
        service_request_id=service_request_id,
        customer_id=user.id,
        service_provider_id=service_request.service_provider_id,
        rating=rating,
        review_description=review_description
    )

    db.session.add(service_review)
    db.session.commit()

    return jsonify({'message': 'Service rated successfully'}), 200



@app.route('/api/admin/block/<int:user_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def blacklist_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        user.active = False
        db.session.commit()
        return jsonify({'message': 'User blacklisted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to blacklist user', 'error': str(e)}), 500


@app.route('/api/admin/unblock/<int:user_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def unblacklist_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        user.active = True
        db.session.commit()
        return jsonify({'message': 'User unblacklisted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to unblacklist user', 'error': str(e)}), 500


@app.route('/api/admin/unapproved_providers', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_unapproved_providers():
    try:
        unapproved_providers = User.query.filter(
            User.active == False,
            User.roles.any(name='service_professional')
        ).all()

        providers_list = [{
            'id': provider.id,
            'name': provider.name,  
            'email': provider.email,
            'service_name': provider.service_name, 
            'experience': provider.service_provider_experience 
        } for provider in unapproved_providers]

        return jsonify(providers_list), 200

    except Exception as e:
        return jsonify({'message': 'Failed to fetch unapproved providers', 'error': str(e)}), 500


@app.route('/api/admin/approve_provider/<int:provider_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def approve_provider(provider_id):
    try:
        provider = User.query.get(provider_id)
        if not provider:
            return jsonify({'message': 'Provider not found'}), 404

        provider.active = True
        db.session.commit()
        return jsonify({'message': 'Provider approved successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to approve provider', 'error': str(e)}), 500


@app.route('/api/professional/accept_service_request/<int:request_id>', methods=['PUT'])
@auth_required('token')
@roles_required('service_professional')
def accept_service_request(request_id):
    service_request = ServiceRequest.query.get(request_id)

    if not service_request:
        return jsonify({'message': 'Service request not found'}), 404

    # if service_request.service_status != 'pending':
    #     return jsonify({'message': 'Service request is not available for acceptance'}), 400

    user = current_user

    service_request.service_status = 'in progress'
    service_request.service_provider_id = user.id

    db.session.commit()

    return jsonify({'message': 'Service request accepted successfully'}), 200


@app.route('/api/professional/reject_service_request/<int:request_id>', methods=['PUT'])
@auth_required('token')
@roles_required('service_professional')
def reject_service_request(request_id):
    service_request = ServiceRequest.query.get(request_id)

    if not service_request:
        return jsonify({'message': 'Service request not found'}), 404

    # if service_request.service_status != 'pending':
    #     return jsonify({'message': 'Service request is not available for rejection'}), 400

    service_request.service_status = 'rejected'

    db.session.commit()

    return jsonify({'message': 'Service request rejected successfully'}), 200

@app.route('/api/professional/complete_service_request/<int:request_id>', methods=['PUT'])
@auth_required('token')
@roles_required('service_professional')
def complete_service_request(request_id):
    service_request = ServiceRequest.query.get(request_id)

    if not service_request:
        return jsonify({'message': 'Service request not found'}), 404

    if service_request.service_status != 'in progress':
        return jsonify({'message': 'Service request is not available for completion'}), 400

    service_request.service_status = 'completed'
    service_request.date_of_completion = datetime.utcnow()

    db.session.commit()

    return jsonify({'message': 'Service request completed successfully'}), 200
    
    
@app.route('/api/professional/summary', methods=['GET'])
@auth_required('token')
@roles_required('service_professional')
def get_professional_summary():
    try:
        user_id = current_user.id

        total_requests = ServiceRequest.query.filter_by(service_provider_id=user_id).count()
        pending_requests = ServiceRequest.query.filter_by(service_provider_id=user_id, service_status='requested').count()
        rejected_requests = ServiceRequest.query.filter_by(service_provider_id=user_id, service_status='rejected').count()
        completed_requests = ServiceRequest.query.filter_by(service_provider_id=user_id, service_status='completed').count()
        in_progress_requests = ServiceRequest.query.filter_by(service_provider_id=user_id, service_status='in progress').count()

        return jsonify({
            'totalRequests': total_requests,
            'pendingRequests': pending_requests,
            'rejectedRequests': rejected_requests,
            'completedRequests': completed_requests,
            'acceptedRequests': in_progress_requests
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to fetch professional summary', 'error': str(e)}), 500
    
@app.route('/api/admin/summary', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_admin_summary():
    try:

        customers_count = User.query.join(UserRole).join(Role).filter(Role.name == 'customer').count()
        professionals_count = User.query.join(UserRole).join(Role).filter(Role.name == 'service_professional').count()

        total_services = Services.query.count()

        total_requests = ServiceRequest.query.count()
        completed_requests = ServiceRequest.query.filter_by(service_status="completed").count()
        in_progress_requests = ServiceRequest.query.filter_by(service_status="in progress").count()
        rejected_requests = ServiceRequest.query.filter_by(service_status="rejected").count()
        pending_requests = ServiceRequest.query.filter_by(service_status="pending").count()

        return jsonify({
            'totalCustomers': customers_count,
            'totalProfessionals': professionals_count,
            'totalServices': total_services,
            'totalRequests': total_requests,
            'requestStatus': {
                'Completed': completed_requests,
                'In Progress': in_progress_requests,
                'Rejected': rejected_requests,
                'Pending': pending_requests
            }
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to fetch admin summary', 'error': str(e)}), 500

@app.route('/api/service_professional/reviews', methods=['GET'])
@auth_required('token')
@roles_required('service_professional')
def get_service_professional_reviews():
    try:
        user = current_user  

        reviews = Review.query.filter_by(service_provider_id=user.id).all()

        review_data = []
        for review in reviews:
            service_request = ServiceRequest.query.get(review.service_request_id)
            service_name = None
            
            if service_request:
                service = Services.query.get(service_request.service_id)
                service_name = service.name if service else "Unknown"
                customer_name = User.query.get(review.customer_id).name

            review_data.append({
                'service_request_id': review.service_request_id,
                'service_name': service_name if service_name else "Unknown",
                'customer_id': review.customer_id,
                'rating': review.rating,
                'review_description': review.review_description,
                'customer_name': customer_name
            })

        return jsonify({'reviews': review_data}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch reviews', 'error': str(e)}), 500



@app.route('/api/admin/reviews', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_reviews():
    try:
        reviews = Review.query.all()
        review_data = []

        for review in reviews:
            service_name = "Unknown" 

            
            service_request = ServiceRequest.query.get(review.service_request_id)

            if service_request and service_request.service_id:
                service = Services.query.get(service_request.service_id)
                if service:
                    service_name = service.name 

           
            customer = User.query.get(review.customer_id)
            service_provider = User.query.get(review.service_provider_id)

            review_data.append({
                'customer_id': review.customer_id,
                'customer_name': customer.name if customer else "Unknown",  
                'service_provider_id': review.service_provider_id,
                'service_provider_name': service_provider.name if service_provider else "Unknown",  
                'service_name': service_name,
                'rating': review.rating,
                'review_description': review.review_description
            })

        return jsonify({'reviews': review_data}), 200

    except Exception as e:
        return jsonify({'error': 'An error occurred while fetching reviews', 'details': str(e)}), 500

@app.route('/api/admin/customers', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_customers():
    customers = User.query.filter(User.roles.any(name='customer')).all()
    customer_list = [{
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
    } for customer in customers]

    return jsonify({"customers": customer_list}), 200


@app.route('/api/admin/service_professionals', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_service_professionals():
    professionals = User.query.filter(User.roles.any(name='service_professional')).all()
    professional_list = [{
        "id": professional.id,
        "name": professional.name,
        "email": professional.email,
        "experience": professional.service_provider_experience
    } for professional in professionals]

    return jsonify({"service_professionals": professional_list}), 200

@app.route('/api/admin/users', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_users():
    users = User.query.all() 

    user_list = []
    for user in users:
        if any(role.name == "customer" for role in user.roles):
            role = "customer"
        elif any(role.name == "service_professional" for role in user.roles):
            role = "service_professional"
        else:
            continue  

        user_list.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": role,
            "active": user.active  
        })

    return jsonify({"users": user_list}), 200


@app.route('/api/admin/users/<int:user_id>/toggle', methods=['PATCH'])
@auth_required('token')
@roles_required('admin')
def toggle_user_status(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    
    if any(role.name == "admin" for role in user.roles):
        return jsonify({"error": "Cannot modify admin users"}), 403

    
    user.active = not user.active
    db.session.commit()

    return jsonify({"message": "User status updated", "active": user.active}), 200

@app.route('/api/customer/service', methods=['GET'])
@auth_required('token')
@roles_required('customer')
def get_services_customer():
    try:
        services = Services.query.all() 
        if not services:
            return jsonify({'message': 'No services found'}), 404

        result = []
        for service in services:
            if service.user_id is None:  
                continue  
            
            user = User.query.get(service.user_id)
            if not user:  
                continue

            result.append({
                'id': service.id,
                'name': service.name,
                'base_price': service.base_price,
                'description': service.description,
                'user_name': user.name,
                'service_provider_id': user.id  
            })

        if not result:
            return jsonify({'message': 'No valid service requests found'}), 404

        return jsonify({'service_requests': result}), 200

    except Exception as e:
        return jsonify({'message': 'Failed to fetch services', 'error': str(e)}), 500
    
    
@app.route('/api/customer/in_progress_requests', methods=['GET'])
@auth_required('token')
@roles_accepted('customer')
def get_in_progress_requests():
    try:
        service_requests = service_requests = ServiceRequest.query.filter(
                                                ServiceRequest.user_id == current_user.id,
                                                ServiceRequest.service_status.in_(['in progress', 'pending'])  
                                            ).all()

        result = []
        for request in service_requests:
            provider = User.query.get(request.service_provider_id)  

            result.append({
                'id': request.id,
                'service_id': request.service_id,
                'service_name': Services.query.get(request.service_id).name,
                'service_provider_email': provider.email if provider else None,
                'service_status': request.service_status,
                'date_of_register': request.date_of_register
            })
        
        return jsonify({'in_progress_requests': result}), 200

    except Exception as e:
        return jsonify({'message': 'Error retrieving in-progress requests', 'error': str(e)}), 500
    
@app.route('/api/customer/complete_service_request/<int:request_id>', methods=['PUT'])
@auth_required('token')
@roles_required('customer')
def complete_service_cust_request(request_id):
    service_request = ServiceRequest.query.get(request_id)

    if not service_request:
        return jsonify({'message': 'Service request not found'}), 404

    if service_request.service_status != 'in progress':
        return jsonify({'message': 'Service request is not available for completion'}), 400

    service_request.service_status = 'completed'
    service_request.date_of_completion = datetime.utcnow()

    db.session.commit()

    return jsonify({'message': 'Service request completed successfully'}), 200


@app.route('/api/customer/completed_requests', methods=['GET'])
@auth_required('token')
@roles_accepted('customer')
def get_comp_requests():
    try:
        service_requests = ServiceRequest.query.filter_by(user_id=current_user.id, service_status='completed').all()

        result = []
        for request in service_requests:
            provider = User.query.get(request.service_provider_id)  

            result.append({
                'id': request.id,
                'service_id': request.service_id,
                'service_name': Services.query.get(request.service_id).name,
                'service_provider_email': provider.email if provider else None,
                'service_status': request.service_status,
                'date_of_register': request.date_of_register,
                'date_of_completion': request.date_of_completion
            })
            print(result)
        
        return jsonify({'completed_requests': result}), 200

    except Exception as e:
        return jsonify({'message': 'Error retrieving in-progress requests', 'error': str(e)}), 500

@app.route('/api/search_services', methods=['GET'])
def search_services():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"message": "No query provided"}), 400

    services = Services.query.filter(Services.name.ilike(f"%{query}%")).all()

   
    services_list = []
    for s in services:
        if s.user_id is None:  
                continue
        services_list.append({
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "base_price": s.base_price,
                "user_name": User.query.get(s.user_id).name if s.user_id else None
            })

    return jsonify({"services": services_list})


@app.route('/api/search_professional', methods=['GET'])
def search_professional():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"message": "No query provided"}), 400

    users = User.query.filter(User.name.ilike(f"%{query}%")).all()

    users_list = []
    for s in users:
        if s.id is None:  
                continue
        users_list.append({
                "id": s.id,
                "name": s.name,
                "email": s.email,
            })

    return jsonify({"users": users_list})

