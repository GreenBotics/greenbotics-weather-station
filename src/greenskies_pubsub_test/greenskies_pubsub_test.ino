#include <ESP8266WiFi.h>
#include "configuration.h"

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_BME280.h>
#include <Adafruit_Sensor.h>

#include <OneWire.h>

//setup sensors / pins
int DS18S20_Pin = 2; //DS18S20 Signal pin on digital 20
int depthTriggerPin = 5;
int depthEchoPin = 4;


//sensors init
Adafruit_BME280 bme; // I2C

//Temperature chip i/o
OneWire ds(DS18S20_Pin);

//sensors data
float temperature_0 = 0;
float humidity_0 = 0;
float baro_0 = 0;

float temperature_1 = 0; // water temperature
float waterDepth_0 = 0;


//other setup
#include <ArduinoJson.h>
StaticJsonBuffer<200> jsonBuffer;
JsonObject& root = jsonBuffer.createObject();
long lastMsg = 0;
char msg[400];

//mqtt setup
#include <PubSubClient.h>
WiFiClient espClient;
PubSubClient mqtt(espClient);

/*#include <EEPROM.h>
#include "myDelay.h"

// WiFi parameters
bool wifiInitDone    = false;
bool ssidInitialized = false;
bool passwordInitialized = false;

//for timeSync
long lastTimeSync = 0;

long lastMsg = 0;
char msg[400];
int value = 0;

//String      nodeFullName = "greenbotics-node-" + String(nodeId);*/

#include "setupWifi.h"

#include "readDepth.h"
#include "readTemp.h"

void setup(void)
{
  // Start Serial
  /*
  //USE_SERIAL.setDebugOutput(true);
  USE_SERIAL.println();
  USE_SERIAL.println();
  USE_SERIAL.println();
  for(uint8_t t = 4; t > 0; t--) {
      USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
      USE_SERIAL.flush();
      delay(1000);
  }*/
  
  Serial.begin(115200);
  Serial.println('Node started');

  setupWifi();


  //configure I2C
  Wire.pins(13,14);
  //configure communications
  // Give name and ID to device
  while( !bme.begin() ) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    delay(1000);
  }

  pinMode(depthTriggerPin, OUTPUT);
  pinMode(depthEchoPin, INPUT);

  //setup message package
  root["nodeId"]= nodeId;

  //setup mqtt
  mqtt.setServer(mqtt_server, 1883);
  mqtt.setCallback(callback);
  /*if(! wifiInitDone){
    wifiInitDone = setupWifi();
  }*/
  //
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  // Switch on the LED if an 1 was received as first character
  if ((char)payload[0] == '1') {
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!mqtt.connected()) {
    Serial.print("Attempting MQTT connection to ");
    Serial.print(mqtt_server);
    // Attempt to connect
    if (mqtt.connect("greenbotics-node-0")) {
      Serial.println("connected");

      // Once connected, publish an announcement...
      mqtt.publish("nodeOnline", nodeId);

      // ... and resubscribe
      mqtt.subscribe("cmd");//command
      mqtt.subscribe("timeSync");//time sync

    } else {
      Serial.print("failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void loop(){

  if (!mqtt.connected()) {
    reconnect();
  }
  mqtt.loop();

  //do the sensor readings
  temperature_0 = bme.readTemperature();
  humidity_0 = bme.readHumidity();
  baro_0 = bme.readPressure() / 100.0F;

  //water temperature
  temperature_1 = readTemp(ds);

  //water depth
  waterDepth_0 = readDepth(depthTriggerPin, depthEchoPin);

  //time sync operation to keep this node in sync
  /*mqtt.publish("timeSync/req", "");
  */

  //Serial.print("Depth");
  //Serial.println(waterDepth_0);
  //Serial.print("Water temperature: ");
  //Serial.println(temperature_1);

  //send out message
  //dtostrf(temperature_0, 4, 2, msg);

  //one way to deal with it
  root["t_0"] = temperature_0;
  root["t_1"] = temperature_1;
  root["h_0"] = humidity_0;
  root["b_0"] = baro_0;
  root["wd_0"] = waterDepth_0;
  root.printTo(msg, sizeof(msg));

  //Serial.print("Publish message: ");
  //Serial.println(msg);
  mqtt.publish("sensorData", msg);

  /*other way: less boilerplate, but less practical on the recieving end, requires
  changes when topology of network changes ? or we could use something
  like /greenbotics/nodes/uuid/temperature
  */
  /*
  dtostrf(temperature_0, 4, 2, msg);
  mqtt.publish("/greenbotics/foo/0/temperature", msg);
  dtostrf(humidity_0, 4, 2, msg);
  mqtt.publish("/greenbotics/foo/0/humidity", msg);
  dtostrf(baro_0, 4, 2, msg);
  mqtt.publish("/greenbotics/foo/0/baro", msg);*/
  delay(2000);//give the system enough time to send outgoing messages
  // deepSleep time is defined in microseconds. Multiply seconds by 1e6 see https://learn.sparkfun.com/tutorials/esp8266-thing-hookup-guide/example-sketch-goodnight-thing-sleep-mode
  ESP.deepSleep(sleepTimeS * 1000000, WAKE_RF_DEFAULT);
}
