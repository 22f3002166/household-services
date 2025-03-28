from flask_restful import Api, Resource, reqparse
from models import *
from datetime import datetime
from flask import jsonify, request
from flask_security import auth_required, roles_required, current_user, hash_password, roles_accepted

api = Api()

def roles_list(roles):
    role_list = []
    for role in roles:
        role_list.append(role.name)
    return role_list

parser = reqparse.RequestParser()

parser.add_argument("name")
parser.add_argument("base_price")
parser.add_argument("description")

class ServiceApi(Resource):
    @auth_required('token')
    @roles_accepted("admin", "customer", "service_professional")
    def get(self):
        services = []
        service_json = []
        
        if "admin" in roles_list(current_user.roles):
            services = Services.query.all()
        elif "service_professional" in roles_list(current_user.roles):
            services = Services.query.filter_by(user_id = current_user.id).all()
        elif "customer" in roles_list(current_user.roles):
            services = Services.query.all()
        for service in services:
            service_json.append({
                "id": service.id,
                "name": service.name,
                "base_price": service.base_price,
                "description": service.description
            })
        if service_json:
            return jsonify(service_json)
        return jsonify({"message": "No services found"})
    
    @auth_required('token')
    @roles_accepted("admin")
    def post(self):
        try:
            args = parser.parse_args()
            service = Services(name = args["name"],
                            base_price = args["base_price"],
                            description = args["description"],
                            user_id = current_user.id)
            db.session.add(service)
            try:
                db.session.commit()
            except:
                db.session.rollback()
                return{
                    "message": "issue in commiting"
                }
            return{
                "message": "created",
                "name": args["name"]
            }
        except:
            return{
                "message": "issue in creating"
            }
    @auth_required('token')
    @roles_accepted("admin")
    def put(self, service_id):
        args = parser.parse_args()
        service = Services.query.get(service_id)
        service.name = args["name"]
        service.base_price = args["base_price"]
        service.description = args["description"]
        db.session.commit()
        return{
            "message": "updated",
            "name": args["name"]
        }
    @auth_required('token')
    @roles_accepted("admin")
    def delete(self, service_id):
        args = parser.parse_args()
        service = Services.query.get(service_id)
        db.session.delete(service)
        db.session.commit()
        return{
            "message": "deleted",
            "name": args["name"]
        }
            

api.add_resource(ServiceApi, '/api/service_get', '/api/service_create', '/api/service_update/<int:service_id>', '/api/service_delete/<int:service_id>')

# service_request_parser = reqparse.RequestParser()
# service_request_parser.add_argument("service_id")
# service_request_parser.add_argument("date_of_completion")
# service_request_parser.add_argument("service_status")
# service_request_parser.add_argument("remarks")
# service_request_parser.add_argument("service_provider_id")

# class ServiceRequestApi(Resource):
#     @auth_required('token')
#     @roles_accepted("customer", "service_professional") 
#     def post(self):
#         try:
#             # Print out the parsed arguments for debugging
#             args = service_request_parser.parse_args()
#             print("Parsed Arguments:", args)

#             service = Services.query.get(args["service_id"])

#             if not service:
#                 return {"message": "Service not found"}, 404

#             # Auto-assign the service provider based on the service
#             service_provider_id = service.user_id  # The owner of the service is the provider

#             # Verbose logging of all attributes
#             print("Creating ServiceRequest with:")
#             print(f"service_id: {args['service_id']}")
#             print(f"user_id: {current_user.id}")
#             print(f"service_provider_id: {service_provider_id}")

#             service_request = ServiceRequest(
#                 service_id=args["service_id"],
#                 user_id=current_user.id,
#                 service_provider_id=service_provider_id,
#                 date_of_register=datetime.utcnow(),
#                 service_status="Pending",
#                 is_active_request=True
#             )

#             db.session.add(service_request)
            
#             try:
#                 db.session.commit()
#             except Exception as commit_error:
#                 print(f"Commit Error: {commit_error}")
#                 db.session.rollback()
#                 return jsonify({
#                     "message": "Error committing to database",
#                     "error": str(commit_error),
#                     "service_id": args["service_id"],
#                     "user_id": current_user.id,
#                     "service_provider_id": service_provider_id,
#                     "service_status": "Pending",
#                     "is_active_request": True
#                 }), 500

#             return jsonify({
#                 "message": "Service request created successfully",
#                 "service_request_id": service_request.id,
#                 "service_provider_id": service_provider_id
#             }), 201

#         except Exception as e:
#             print(f"Full Error Traceback: {e}")
#             db.session.rollback()
#             return {"message": "Issue creating request", "error": str(e)}, 500

#     @auth_required('token')
#     @roles_accepted("admin", "customer", "service_professional")
#     def get(self, request_id=None):
#         if request_id:
#             service_request = ServiceRequest.query.get(request_id)
#             if not service_request:
#                 return {"message": "Service request not found"}, 404

#             return {
#                 "id": service_request.id,
#                 "service_id": service_request.service_id,
#                 "customer_id": service_request.user_id,
#                 "service_provider_id": service_request.service_provider_id,
#                 "status": service_request.service_status,
#                 "remarks": service_request.remarks,
#                 "date_of_register": service_request.date_of_register,
#                 "date_of_completion": service_request.date_of_completion,
#                 "is_active_request": service_request.is_active_request
#             }, 200

#         # If no ID provided, return all requests
#         service_requests = ServiceRequest.query.all()
#         return [{
#             "id": req.id,
#             "service_id": req.service_id,
#             "customer_id": req.user_id,
#             "service_provider_id": req.service_provider_id,
#             "status": req.service_status,
#             "remarks": req.remarks,
#             "date_of_register": req.date_of_register,
#             "date_of_completion": req.date_of_completion,
#             "is_active_request": req.is_active_request
#         } for req in service_requests], 200
        
#     @auth_required('token')
#     @roles_accepted("admin", "service_professional")  # Only admins and service professionals can update
#     def put(self, request_id):
#         try:
#             service_request = ServiceRequest.query.get(request_id)
#             if not service_request:
#                 return {"message": "Service request not found"}, 404

#             args = service_request_parser.parse_args()
#             if args["service_status"]:
#                 service_request.service_status = args["service_status"]
#             if args["date_of_completion"]:
#                 service_request.date_of_completion = datetime.strptime(args["date_of_completion"], "%Y-%m-%d")
#             if args["remarks"]:
#                 service_request.remarks = args["remarks"]

#             db.session.commit()
#             return {"message": "Service request updated successfully"}, 200

#         except Exception as e:
#             db.session.rollback()
#             return {"message": "Issue updating request", "error": str(e)}, 500
#     @auth_required('token')
#     @roles_accepted("admin")  # Only admin can delete
#     def delete(self, request_id):
#         try:
#             service_request = ServiceRequest.query.get(request_id)
#             if not service_request:
#                 return {"message": "Service request not found"}, 404

#             db.session.delete(service_request)
#             db.session.commit()
#             return {"message": "Service request deleted successfully"}, 200

#         except Exception as e:
#             db.session.rollback()
#             return {"message": "Issue deleting request", "error": str(e)}, 500


# # API Routes
# api.add_resource(ServiceRequestApi, "/api/service-request", "/api/service-request/<int:request_id>")   