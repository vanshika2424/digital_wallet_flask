@echo on
set FLASK_APP=app.py
set FLASK_DEBUG=1
python311.exe -m flask run --debug
pause
