from celery import Celery, Task
from config import CLOUDAMQP_URL
from scheduler.schedule_config import beat_schedule


def celery_init_app() -> Celery:

    celery_app : Celery = Celery("celery_module",
                                 backend=CLOUDAMQP_URL, 
                                 broker=CLOUDAMQP_URL, 
                                 task_ignore_result=True)
    
    celery_app.set_default()
    celery_app.autodiscover_tasks()
    celery_app.conf.timezone = "EST"
    celery_app.conf.beat_schedule = beat_schedule
    return celery_app

celery_app = celery_init_app()