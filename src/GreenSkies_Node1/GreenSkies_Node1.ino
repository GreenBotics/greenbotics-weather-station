#include <ESP8266WiFi.h>
#include <aREST.h>
#include <EEPROM.h>

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <Adafruit_SI1145.h>

#include "configuration.h"

// Create aREST instance
aREST rest = aREST();
Adafruit_BME280 bme; // I2C

// WiFi parameters
bool wifiInitStarted = true;
bool wifiInitDone    = false;


// Create an instance of the server
WiFiServer server(LISTEN_PORT);

// Variables to be exposed to the API
float temperature;
float humidity;
float pressure;

void setup(void)
{  
  // Start Serial
  Serial.begin(115200);
  //configure I2C
  Wire.pins(13,14);

  // Init variables and expose them to REST API
  temperature = 0;
  humidity = 0;
  pressure = 0;
  
  rest.variable("temperature",&temperature);
  rest.variable("humidity",&humidity);
  rest.variable("pressure",&pressure);
 
  // Give name and ID to device
  rest.set_id("1");
  rest.set_name("GreenSkies_Node1");

  while( !bme.begin() ) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    myDelay(1000);
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
 
  // Start the server
  server.begin();
  Serial.println("Server started");
  
  // Print the IP address
  Serial.print(WiFi.localIP());
  Serial.print(":");
  Serial.print(LISTEN_PORT);
  Serial.println();
  
  wifiInitDone = true;
}

void handleRestCalls(){
  // Handle REST calls
  WiFiClient client = server.available();
  if (!client) {
    return;
  }
  while(!client.available()){
    myDelay(1);
  }
  rest.handle(client);
}


//////////////////
void loop() {
  myDelay(1);
  if(wifiInitStarted && ! wifiInitDone){
    setupWifi();
  }
  if(wifiInitDone){
    handleRestCalls();
  }

  //fetch sensor data
  temperature = bme.readTemperature();
  pressure    = bme.readPressure() / 100.0F;
  humidity    = bme.readHumidity();
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

