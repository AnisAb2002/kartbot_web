from flask import Flask
import easygopigo3
import threading
import time
from easygopigo3 import Servo

# =========================
# INITIALISATION
# =========================

app = Flask(__name__)
gpg = easygopigo3.EasyGoPiGo3()

# =========================
# CAPTEURS
# =========================

distance_value = 0
tours_effectues = 1

distance_sensor = None
light_sensor = None

try:
    # Ultrason sur I2C
    distance_sensor = gpg.init_distance_sensor()
    print("Ultrason OK (I2C)")
except Exception as e:
    print("Erreur Ultrason :", e)

try:
    # Light sensor sur AD2
    light_sensor = gpg.init_light_sensor("AD2")
    print("Light Sensor OK (AD2)")
except Exception as e:
    print("Erreur Light Sensor :", e)

# =========================
# SERVO ULTRASON
# =========================

try:
    servo = Servo("SERVO1")
    print("Servo OK")
except Exception as e:
    print("Erreur Servo :", e)
    servo = None

# =========================
# STABILISATION
# =========================

time.sleep(2)

# =========================
# THREAD CAPTEURS
# =========================

def read_sensors():
    global distance_value, tours_effectues

    SEUIL_NOIR = 2400
    derniere_detection = 0

    while True:

        # -------- DISTANCE --------
        if distance_sensor is not None:
            try:
                d = distance_sensor.read_mm()

                if d is not None and 20 < d < 4000:
                    distance_value = int(d / 10)  # cm

            except Exception as e:
                print("Erreur distance :", e)

        # -------- LIGHT SENSOR --------
        if light_sensor is not None:
            try:
                val = light_sensor.read()

                if val is not None and 0 < val < 4095:

                    # Détection ligne noire
                    if val < SEUIL_NOIR:

                        now = time.time()

                        # Anti double détection
                        if now - derniere_detection > 3:
                            tours_effectues += 1
                            derniere_detection = now

                            print(f"+1 Tour : {tours_effectues}")

            except Exception as e:
                print("Erreur lumière :", e)

        time.sleep(0.1)

# =========================
# THREAD SERVO
# =========================

def scan_servo():

    if servo is None:
        return

    angle = 30
    direction = 1

    while True:

        try:
            servo.rotate_servo(angle)

            angle += direction * 10

            if angle >= 150:
                direction = -1

            elif angle <= 30:
                direction = 1

        except Exception as e:
            print("Erreur servo :", e)

        time.sleep(0.2)

# =========================
# LANCEMENT THREADS
# =========================

threading.Thread(target=read_sensors, daemon=True).start()
threading.Thread(target=scan_servo, daemon=True).start()

# =========================
# ROUTES API
# =========================

@app.route('/distance')
def distance():
    return str(distance_value)

@app.route('/tours')
def tours():
    return str(tours_effectues)

# -------- MOTEURS --------

@app.route('/forward')
def forward():
    gpg.forward()
    return "OK"

@app.route('/backward')
def backward():
    gpg.backward()
    return "OK"

@app.route('/left')
def left():
    gpg.left()
    return "OK"

@app.route('/right')
def right():
    gpg.right()
    return "OK"

@app.route('/stop')
def stop():
    gpg.stop()
    return "OK"

# =========================
# START SERVEUR
# =========================

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, threaded=True)
