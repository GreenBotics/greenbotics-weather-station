#include <ESP8266WiFi.h>
#include <aREST.h>
#include <EEPROM.h>

#include "getUserInput.h"

String content = "";
String content2 = "";
char character;
  
// Create aREST instance
aREST rest = aREST();


// WiFi parameters
bool wifiInitialized = false;
bool wifiInitDone    = false;
bool ssidInitialized = false;
bool passwordInitialized = false;
//const char* ssid = "";
String ssid = "";
String password = "";
//const char* password = "";

// The port to listen for incoming TCP connections 
#define LISTEN_PORT           3020

// Create an instance of the server
WiFiServer server(LISTEN_PORT);

// Variables to be exposed to the API
int temperature;
int humidity;
int pressure;

void setup(void)
{  
  pinMode(0, OUTPUT);
  // Start Serial
  Serial.begin(115200);
  
  // Init variables and expose them to REST API
  temperature = 24;
  humidity = 40;
  pressure = 10;
  rest.variable("temperature",&temperature);
  rest.variable("humidity",&humidity);
  rest.variable("pressure",&pressure);

  // Function to be exposed
  rest.function("led",ledControl);
  
  // Give name and ID to device
  rest.set_id("1");
  rest.set_name("esp8266");
}

void getWifiData(){
  //ask user for data 
  ssid = getUserInput(ssidInitialized,"SSID");
  
  if(ssidInitialized){
    password = getUserInput(passwordInitialized,"password");
  }
  
  if(ssidInitialized && passwordInitialized && !wifiInitialized){
    Serial.print("Validated ssid: ");
    Serial.println(ssid.c_str());
    Serial.print("Pasword: ");
    Serial.println(password.c_str());

    wifiInitialized = true;
  }

}

void setupWifi(){
  // Connect to WiFi
  WiFi.begin(ssid.c_str(), password.c_str());
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
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
    delay(1);
  }
  rest.handle(client);
}

void loop() {
  getWifiData();
  if(wifiInitialized && ! wifiInitDone){
    setupWifi();
    wifiInitDone = true;
  }
  if(wifiInitDone){
    handleRestCalls();
  }
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
