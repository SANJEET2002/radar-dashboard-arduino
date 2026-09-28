#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

#define TRIG_PIN 14
#define ECHO_PIN 26
#define SERVO_PIN 13
#define BUZZER_PIN 33
// Wi-Fi
const char* ssid = "YOUR WIFI SSID";
const char* password = "YOUR WIFI PASSWORD";

WebServer server(80);

Servo radarServo;

// Servo settings
int angle = 15;
bool forward = true;
unsigned long buzzerMillis = 0;
bool buzzerState = false;
int detectionCount = 0;

const int MIN_ANGLE = 0;
const int MAX_ANGLE = 180;

unsigned long previousServoMillis = 0;
const unsigned long servoInterval = 20;

float currentDistance = -1;

//------------------------------------------------------------

float getDistance()
{
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0)
    return -1;

  return duration * 0.0343 / 2.0;
}

//------------------------------------------------------------

void handleData()
{
  server.sendHeader("Access-Control-Allow-Origin", "*");

  String data = String(angle) + "," + String(currentDistance, 1);

  server.send(200, "text/plain", data);
}

//------------------------------------------------------------

void setup()
{
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
pinMode(BUZZER_PIN, OUTPUT);
digitalWrite(BUZZER_PIN, LOW);
  radarServo.setPeriodHertz(50);
  radarServo.attach(SERVO_PIN, 500, 2400);

  radarServo.write(angle);

  // Wi-Fi
  WiFi.begin(ssid, password);

  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi connected");

  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // Data endpoint
  server.on("/data", handleData);

  server.begin();

  Serial.println("Web server started");
}

//------------------------------------------------------------

void loop()
{
  server.handleClient();

  unsigned long currentMillis = millis();

  if (currentMillis - previousServoMillis >= servoInterval)
  {
    previousServoMillis = currentMillis;

    radarServo.write(angle);

    currentDistance = getDistance();
unsigned long now = millis();

if (currentDistance > 0 && currentDistance <= 20)
{
  detectionCount++;

  if (detectionCount >= 2)
  {
    if (now - buzzerMillis >= 300)
    {
      buzzerMillis = now;

      buzzerState = !buzzerState;

      digitalWrite(BUZZER_PIN, buzzerState);
    }
  }
}
else
{
  detectionCount = 0;
  buzzerState = false;
  digitalWrite(BUZZER_PIN, LOW);
}

    // Serial.print(angle);
    // Serial.print(",");
    // Serial.println(currentDistance);

    if (forward)
    {
      angle++;

      if (angle >= MAX_ANGLE)
      {
        angle = MAX_ANGLE;
        forward = false;
      }
    }
    else
    {
      angle--;

      if (angle <= MIN_ANGLE)
      {
        angle = MIN_ANGLE;
        forward = true;
      }
    }
  }
}