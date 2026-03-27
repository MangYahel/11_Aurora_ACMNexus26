import requests

url = "http://127.0.0.1:5000/analyze"

session_data = {
    "login_hour": 2,
    "files_accessed": 87,
    "download_size": 900,
    "location_code": 2,
    "device_code": 2,
    "department_code": 4
}

response = requests.post(url, json=session_data)

print(response.json())