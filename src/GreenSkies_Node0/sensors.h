/*
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

#define BME_SCK 13
#define BME_MISO 12
#define BME_MOSI 11
#define BME_CS 10

#define SEALEVELPRESSURE_HPA (1013.25)

Adafruit_BME280 bme; // I2C */


struct RPMMeasurer {
  int hallPin;
  int windRPM;
  int curState;
  int prevState;
  
  unsigned long startTime;
  unsigned long currentTime;
  unsigned long elapsedTime; 

  RPMMeasurer(){
    windRPM = 0;
    curState = 0;
    prevState= 0;
  
    startTime = millis();
    currentTime = millis();
    elapsedTime = 0; 

    hallPin = -1;
  }

  RPMMeasurer(int hallPin){
    windRPM = 0;
    curState = 0;
    prevState= 0;
  
    startTime = millis();
    currentTime = millis();
    elapsedTime = 0; 

    hallPin = hallPin;
    setup();
  }

  void setup(){
    pinMode(hallPin, INPUT);
  }
  
  int measure() 
  { 
    
    curState = digitalRead(hallPin);
    int time_between_pulses = 10;
    int pulses_per_rev = 1;
    
    if(curState != prevState){
      currentTime = millis();
      elapsedTime = currentTime - startTime;
      windRPM = 60000/(elapsedTime*pulses_per_rev);

      //reset
      prevState = curState;
      startTime = millis();
      currentTime = millis();
      
      return curState;
    }
  }
};


/*const int hallPin = 2; 
const int ledPin =  0;    
int hallState = 0; 

RPMMeasurer rpm;


void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(hallPin, INPUT);
  
  Serial.begin(115200);
  Serial.println(F("BME280 test"));

  if (!bme.begin()) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    while (1);
    delay(1000);
  }
}



void loop() {
    hallState = digitalRead(hallPin);
    rpm.measure(hallState);
    
    Serial.print("Temperature = ");
    Serial.print(bme.readTemperature());
    Serial.println(" *C");

    Serial.print("Pressure = ");

    Serial.print(bme.readPressure() / 100.0F);
    Serial.println(" hPa");

    Serial.print("Approx. Altitude = ");
    Serial.print(bme.readAltitude(SEALEVELPRESSURE_HPA));
    Serial.println(" m");

    Serial.print("Humidity = ");
    Serial.print(bme.readHumidity());
    Serial.println(" %");

    Serial.print("Hall sensor state = ");
    Serial.println(hallState);
    
    Serial.println();
    delay(2000);
}*/


