from celery.schedules import crontab

beat_schedule = {
    'daily_call_scheduler' : {
    
            'task' : 'scheduler.tasks.schedule_daily_calls',
            'args' : (),
            'schedule' : crontab(hour = 0, minute = 0)
    },

}

