#include <ESP8266WiFi.h>
#include <aREST.h>
#include <EEPROM.h>

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>

#include <ArduinoJson.h>
#include <PubSubClient.h>

#include "configuration.h"

#include <Adafruit_BME280.h>



#include <OneWire.h>
int DS18S20_Pin = 2; //DS18S20 Signal pin on digital 20
//Temperature chip i/o
OneWire ds(DS18S20_Pin);


// WiFi parameters
bool wifiInitStarted = true;
bool wifiInitDone    = false;
bool ssidInitialized = false;
bool passwordInitialized = false;

//sensors init
Adafruit_BME280 bme; // I2C


//sensors data
float temperature_0 = 0;
float humidity_0 = 0;
float baro_0 = 0;

float temperature_1 = 0;


StaticJsonBuffer<200> jsonBuffer;
JsonObject& root = jsonBuffer.createObject();

//for timeSync
long lastTimeSync = 0;

const char* mqtt_server = "192.168.1.23";
WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[200];
int value = 0;

const char* nodeId = "0";
//String      nodeFullName = "greenbotics-node-" + String(nodeId);

void setup(void)
{
  // Start Serial
  Serial.begin(115200);
  //configure I2C
  Wire.pins(13,14);

  //configure communications
  // Give name and ID to device

  while( !bme.begin() ) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    myDelay(1000);
  }

  root["nodeId"]= nodeId;

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
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
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("greenbotics-node-0")) {
      Serial.println("connected");

      // Once connected, publish an announcement...
      client.publish("nodeOnline", nodeId);

      // ... and resubscribe
      client.subscribe("cmd");//command
      client.subscribe("timeSync");//time sync

    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


void setupWifi(){
  // Connect to WiFi
  WiFi.begin( ssid, password );
  //set static ip part
  WiFi.config(ip, gateway, subnet);

  while (WiFi.status() != WL_CONNECTED) {
    myDelay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");


  // Print the IP address
  Serial.print(WiFi.localIP());
  Serial.print(":");
  Serial.print(LISTEN_PORT);
  Serial.println();

  wifiInitDone = true;
}



void loop(){
  myDelay(1);
  if(wifiInitStarted && ! wifiInitDone){
    setupWifi();
    wifiInitDone = true;
  }

   if (!client.connected()) {
    reconnect();
  }
  client.loop();

  //time sync operation to keep this node in sync
  client.publish("timeSync/req", "");

  //do the sensor readings
  temperature_0 = bme.readTemperature();
  humidity_0 = bme.readHumidity();
  baro_0 = bme.readPressure() / 100.0F;
  temperature_1 = getTemp();

  //Serial.print("Water temperature: ");
  //Serial.println(temperature_1);

  //send out message
  //dtostrf(temperature_0, 4, 2, msg);

  //one way to deal with it
  root["t_0"] = temperature_0;
  root["t_1"] = temperature_1;
  root["h_0"] = humidity_0;
  root["b_0"] = baro_0;
  root.printTo(msg, sizeof(msg));

  Serial.print("Publish message: ");
  Serial.println(msg);
  client.publish("sensorData", msg);

  /*other way: less boilerplate, but less practical on the recieving end, requires
  changes when topology of network changes ? or we could use something
  like /greenbotics/nodes/uuid/temperature
  */
  /*
  dtostrf(temperature_0, 4, 2, msg);
  client.publish("/greenbotics/foo/0/temperature", msg);
  dtostrf(humidity_0, 4, 2, msg);
  client.publish("/greenbotics/foo/0/humidity", msg);
  dtostrf(baro_0, 4, 2, msg);
  client.publish("/greenbotics/foo/0/baro", msg);*/

  myDelay(200);//give the system enough time to send outgoing messages
  ESP.deepSleep(60000000, WAKE_RF_DEFAULT);

}

void myDelay(int ms) {
    int i;
    for(i=1;i!=ms;i++) {
      delay(1);
      if(i%100 == 0) {
        ESP.wdtFeed();
        yield();
      }
    }
}


float getTemp(){
 //returns the temperature from one DS18S20 in DEG Celsius

 byte data[12];
 byte addr[8];

 if ( !ds.search(addr)) {
   //no more sensors on chain, reset search
   ds.reset_search();
   return -1000;
 }

 if ( OneWire::crc8( addr, 7) != addr[7]) {
   Serial.println("CRC is not valid!");
   return -1000;
 }

 if ( addr[0] != 0x10 && addr[0] != 0x28) {
   Serial.print("Device is not recognized");
   return -1000;
 }

 ds.reset();
 ds.select(addr);
 ds.write(0x44,1); // start conversion, with parasite power on at the end

 byte present = ds.reset();
 ds.select(addr);
 ds.write(0xBE); // Read Scratchpad


 for (int i = 0; i < 9; i++) { // we need 9 bytes
  data[i] = ds.read();
 }

 ds.reset_search();

 byte MSB = data[1];
 byte LSB = data[0];

 float tempRead = ((MSB << 8) | LSB); //using two's compliment
 float TemperatureSum = tempRead / 16;

 return TemperatureSum;

}
