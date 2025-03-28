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

