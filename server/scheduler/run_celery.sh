#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' 
LOGLEVEL="INFO"

# Add the server directory to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Function to start worker
start_worker() {
    echo -e "${GREEN}Starting Celery worker...${NC}"
    celery -A celery_app:celery_app worker --loglevel=$LOGLEVEL &
}

# Function to start beat
start_beat() {
    echo -e "${GREEN}Starting Celery beat...${NC}"
    celery -A celery_app:celery_app beat --loglevel=$LOGLEVEL &
}

# Function to stop all celery processes
stop_all() {
    echo -e "${RED}Stopping all Celery processes...${NC}"
    pkill -f 'celery worker'
    pkill -f 'celery beat'
}

# Help message
show_help() {
    echo "Usage: ./celery.sh [command]"
    echo "Commands:"
    echo "  start        Start both worker and beat"
    echo "  stop         Stop all celery processes"
    echo "  worker       Start only the worker"
    echo "  beat         Start only the beat"
    echo "  restart      Restart all processes"
    echo "  status       Show running celery processes"
}

# Main command handling
case "$1" in
    "start")
        start_worker
        start_beat
        ;;
    "stop")
        stop_all
        ;;
    "worker")
        start_worker
        ;;
    "beat")
        start_beat
        ;;
    "restart")
        stop_all
        sleep 2
        start_worker
        start_beat
        ;;
    "status")
        echo -e "${GREEN}Running Celery processes:${NC}"
        ps aux | grep 'celery' | grep -v grep
        ;;
    *)
        show_help
        ;;
esac 