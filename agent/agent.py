import psutil
import requests
import time
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import pygetwindow as gw

API = "http://localhost:5000/analyze"

file_activity_count = 0
file_events = []
current_app = None
start_time = time.time()
app_usage = {}


class FileHandler(FileSystemEventHandler):
    def on_created(self, event):
        global file_activity_count, file_events
        file_activity_count += 1
        file_events.append("Created: " + event.src_path)

    def on_modified(self, event):
        global file_activity_count, file_events
        file_activity_count += 1
        file_events.append("Modified: " + event.src_path)

    def on_deleted(self, event):
        global file_activity_count, file_events
        file_activity_count += 1
        file_events.append("Deleted: " + event.src_path)


def start_monitoring(path):
    observer = Observer()
    observer.schedule(FileHandler(), path, recursive=True)
    observer.start()
    return observer


def track_active_app():
    global current_app, start_time, app_usage

    try:
        window = gw.getActiveWindow()
        if window:
            app_name = window.title

            if current_app != app_name:
                duration = time.time() - start_time

                if current_app:
                    app_usage[current_app] = app_usage.get(current_app, 0) + duration

                current_app = app_name
                start_time = time.time()
    except:
        pass


WATCH_PATH = "C:/Users/angel/Downloads"


def collect_data():
    global file_activity_count, file_events, app_usage

    track_active_app()

    data = {
        "user_id": "user_1",
        "login_hour": datetime.now().hour,
        "process_count": len(list(psutil.process_iter())),
        "cpu_usage": psutil.cpu_percent(interval=1),
        "network_usage": psutil.net_io_counters().bytes_recv / (1024 * 1024),
        "file_activity": file_activity_count,
        "file_events": file_events[:5],
        "app_usage": app_usage
    }

    file_activity_count = 0
    file_events = []
    app_usage = {}

    return data


if __name__ == "__main__":
    print("🔥 Agent started")

    observer = start_monitoring(WATCH_PATH)

    try:
        while True:
            session = collect_data()

            try:
                res = requests.post(API, json=session)
                print(res.json())
            except Exception as e:
                print("Error:", e)

            time.sleep(5)

    except KeyboardInterrupt:
        observer.stop()

    observer.join()