#include <ESP8266WiFi.h>
#include <aREST.h>
#include <EEPROM.h>

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <Adafruit_SI1145.h>

#include "getUserInput.h"
#include "sensors.h"

// Create aREST instance
aREST rest = aREST();
//BME280 instance 
Adafruit_BME280 bme; // I2C
Adafruit_SI1145 uv = Adafruit_SI1145();//I2C too
//RPMMeasurer windRpm;

// WiFi parameters
bool wifiInitialized = false;
bool wifiInitDone    = false;
bool ssidInitialized = false;
bool passwordInitialized = false;

String ssid = "";
String password = "";


// The port to listen for incoming TCP connections 
#define LISTEN_PORT           3020

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

///
int hallPin = 2;
float windRPM;
int curState = 1;
int prevState = 1;
int rInCycle = 1;

unsigned long startTime;
unsigned long currentTime;
unsigned long elapsedTime; 

void setup(void)
{  
  // Start Serial
  Serial.begin(115200);

  Wire.pins(13,14);

  //windRpm = RPMMeasurer(2);
  //pinMode(hallPin, INPUT);
  
  // Init variables and expose them to REST API
  temperature = 0;
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
  rest.variable("UVL",&UVL);

  // Function to be exposed
  rest.function("led",ledControl);
  
  // Give name and ID to device
  rest.set_id("1");
  rest.set_name("GreenSkiesWeatherStation");

  while( !bme.begin() ) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    myDelay(1000);
  }

  while( !uv.begin() ) {
    Serial.println("Didn't find Si1145");
    myDelay(1000);
  }

}

void getWifiData(){
  //ask user for data 
  /*ssid = getUserInput(ssidInitialized,"SSID");
  
  if(ssidInitialized){
    password = getUserInput(passwordInitialized,"password");
  }
  
  if(ssidInitialized && passwordInitialized && !wifiInitialized){
    Serial.print("Validated ssid: ");
    Serial.println(ssid.c_str());
    Serial.print("Pasword: ");
    Serial.println(password.c_str());

    wifiInitialized = true;
  }*/

  wifiInitialized = true;

}

void setupWifi(){
  // Connect to WiFi
  WiFi.begin("o2-WLAN62","8P46BC9L66U366Q7" );//ssid.c_str(), password.c_str());
  //set static ip part
  WiFi.config(IPAddress(192,168,1,20), IPAddress(192,168,1,1), IPAddress(255,255,255,0));
  
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
  getWifiData();
  if(wifiInitialized && ! wifiInitDone){
    setupWifi();
    wifiInitDone = true;
  }
  if(wifiInitDone){
    handleRestCalls();
  }

  //fetch sensor data
  temperature = bme.readTemperature();
  pressure    = bme.readPressure() / 100.0F;
  humidity    = bme.readHumidity();

  visL        = uv.readVisible();
  UVL         = uv.readIR();
  irL         = uv.readUV();

  //windSpd     = measureRpm(); //digitalRead(hallPin);//windRpm.measure();
  //measureRpm();

}

// Custom function accessible by the API
int ledControl(String command) {
  
  // Get state from command
  int state = command.toInt();

  Serial.print("sent command to led: ");
  Serial.println(state);
  
  digitalWrite(0,state);
  return 1;
}


float measureRpm2() 
{ 
  curState = digitalRead(hallPin);
  
  if(curState == 0 && prevState != curState){
    Serial.println("State change");
    rInCycle++;
  }
  prevState = curState;
  
  currentTime = millis();
  elapsedTime = currentTime - startTime;
  if(elapsedTime >= 60000){
    float rpm = rInCycle;
    //reset
    startTime = millis();
    prevState = curState;
    rInCycle = 0; 

    windSpd = rpm;
  }//one minute has elapsed 
  
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
    if(rpm != windRPM)
    {
      windSpd = rpm;
      windRPM = rpm;
    }
  }
  else if(elapsedTime >= 60000){//more than a minute without activity, reset
    windSpd = 0;
  }
  
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

