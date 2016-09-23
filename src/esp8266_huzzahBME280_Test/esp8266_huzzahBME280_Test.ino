#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

#define BME_SCK 13
#define BME_MISO 12
#define BME_MOSI 11
#define BME_CS 10

#define SEALEVELPRESSURE_HPA (1013.25)

Adafruit_BME280 bme; // I2C
//Adafruit_BME280 bme(BME_CS); // hardware SPI
//Adafruit_BME280 bme(BME_CS, BME_MOSI, BME_MISO,  BME_SCK);


struct RPMMeasurer {
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
  }
  
  //foo() : bar(3) {}   //look, a constructor
  int measure(int state) 
  { 
    curState = state;
    int time_between_pulses = 10;
    int pulses_per_rev = 1;
    
    if(curState != prevState){
      currentTime = millis();
      elapsedTime = currentTime - startTime;
      windRPM =  60000/(time_between_pulses*pulses_per_rev);

      //reset
      prevState = state;
      startTime = millis();
      currentTime = millis();
      
      return windRPM;
    }
  }
};


const int hallPin = 2; 
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
}



/*int measureRPM(int state){
    int windRPM = 0;
  int curState = 0;
  int prevState= 0;
  
  unsigned long startTime = millis();
  unsigned long currentTime = millis();
  unsigned long elapsedTime = 0; 



  int inner(int state){
    curState = state;
    
    if(curState != prevState){
      currentTime = millis();
      elapsedTime = currentTime - startTime;
      windRPM =  60000/(time_between_pulses*pulses_per_rev)

      //reset
      startTime = millis();
      currentTime = millis();
      return windRPM
    }
  }
}*/

