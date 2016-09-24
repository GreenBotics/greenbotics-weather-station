#include <ESP8266WiFi.h>
#include <aREST.h>
#include <EEPROM.h>

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <Adafruit_SI1145.h>

#include "configuration.h"
#include "getUserInput.h"
#include "sensors.h"

// Create aREST instance
aREST rest = aREST();
//BME280 instance 
Adafruit_BME280 bme; // I2C
Adafruit_SI1145 uv = Adafruit_SI1145();//I2C too
//RPMMeasurer windRpm;

// WiFi parameters
bool wifiInitStarted = true;
bool wifiInitDone    = false;
bool ssidInitialized = false;
bool passwordInitialized = false;

// Create an instance of the server
WiFiServer server(LISTEN_PORT);

// Variables to be exposed to the API
float temperature;
float humidity;
float pressure;
float windSpd;
float windDir;
float rain;
float visL;
float irL;
float UVL; 

///for wind speed
int hallPin = 12;
float windRPM;
int curState = 1;
int prevState = 1;
int rInCycle = 1;

unsigned long startTime;
unsigned long currentTime;
unsigned long elapsedTime; 

//dynamic variables
char* nodeId = "0";
float *datas;

void setup(void)
{  
  // Start Serial
  Serial.begin(115200);
  //configure I2C
  Wire.pins(13,14);
  
  pinMode(hallPin, INPUT);
  
  // Init variables and expose them to REST API
  /*temperature = 0;
  humidity = 0;
  pressure = 0;
  windSpd  = 0;
  windDir  = 0;
  rain     = 0;
  visL     = 0;
  irL      = 0;
  UVL      = 0;

  rest.variable("temperature",&temperature);
  rest.variable("humidity",&humidity);
  rest.variable("pressure",&pressure);
  rest.variable("rain",&rain);
  rest.variable("windSpd",&windSpd);
  rest.variable("windDir",&windDir);
  rest.variable("visL",&visL);
  rest.variable("irL",&irL);
  rest.variable("UVL",&UVL);*/
  
  // Give name and ID to device
  rest.set_id(nodeId);
  rest.set_name("GreenSkies_Node");

  while( !bme.begin() ) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    myDelay(1000);
  }

  while( !uv.begin() ) {
    Serial.println("Didn't find Si1145");
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
    wifiInitDone = true;
  }
  if(wifiInitDone){
    handleRestCalls();
  }

  //fetch sensor data
  /*temperature = bme.readTemperature();
  pressure    = bme.readPressure() / 100.0F;
  humidity    = bme.readHumidity();

  visL        = uv.readVisible();
  UVL         = uv.readIR();
  irL         = uv.readUV();*/

  //windSpd     = measureRpm();
  //measureRpm();
}

float measureRpm() 
{ 
  
  curState = digitalRead(hallPin);
  int pulses_per_rev = 1;

  currentTime = millis();
  elapsedTime = currentTime - startTime;
   
  if(curState == 0 && prevState != curState){
    
    float rpm = 60000/(elapsedTime*pulses_per_rev);

    //reset
    startTime = millis();
    prevState = curState;
    //if(rpm != windRPM)
    //{
      windSpd = rpm;
      windRPM = rpm;
    //}
    //Serial.print("windSpd");
    //Serial.println(rpm);
  }
  /*else if(elapsedTime >= 60000){//more than a minute without activity, reset
    windSpd = 0;
  }*/
  
  prevState = curState;

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

