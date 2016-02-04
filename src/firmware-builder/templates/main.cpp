#include <ESP8266WiFi.h>
#include <aREST.h>
#include <EEPROM.h>

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>

#include "configuration.h"

${imports}

// WiFi parameters
bool wifiInitStarted = true;
bool wifiInitDone    = false;
bool ssidInitialized = false;
bool passwordInitialized = false;


//sensors init
${sensorDeclarations}

//sensors data
${declarations}

// Create an instance of the server
WiFiServer server(LISTEN_PORT);
// Create aREST instance
aREST rest = aREST();

void setup(void)
{  
  // Start Serial
  Serial.begin(115200);
  //configure I2C
  Wire.pins(13,14);

  //configure communications
  // Give name and ID to device
  rest.set_id("${node_id}");
  rest.set_name("${node_name}");

  ${initComs}

  //
  ${sensorSetups}
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

void loop(){
  myDelay(1);
  if(wifiInitStarted && ! wifiInitDone){
    setupWifi();
    wifiInitDone = true;
  }
  if(wifiInitDone){
    handleRestCalls();
  }

  //do the sensor readings
  ${readSensors}
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