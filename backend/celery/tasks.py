from celery import shared_task
import time
import flask_excel
from backend.models import *

@shared_task(ignore_result=False)
def add(x, y):
    time.sleep(10)
    return x + y


@shared_task(ignore_result=False)
def create_csv():
    resource = Services.query.all()
    coloumn_names = [coloumn.name for coloumn in Services.__table__.columns]
    csv_out = flask_excel.make_response_from_records(resource, file_type="csv", coloumn_names=coloumn_names)  
    
    with open(".backend/celery/user-downloads/services.csv", "wb") as file:
        file.write(csv_out.data)
        
    return 'services.csv'