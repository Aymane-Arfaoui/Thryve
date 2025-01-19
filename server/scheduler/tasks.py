from scheduler.celery_app import celery_app

@celery_app.task(name="scheduler.tasks.schedule_daily_calls")
def schedule_daily_calls():

    print("Daily calls scheduled")

