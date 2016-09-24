#GreenSkies

Open source, somewhat low cost "Weather station" / sensor network project



##Infos so far:

- temperature, humidity, barometric pressure sensor : BME180
- anemometer (wind speed) hall effect sensor

- remote  but not too much (garden based) : using a ESP8266 as "brain" + network
- low power as much as possible + solar powered if possible



##Included tools:
 ### Firmware generator for Arduino on ESP8266

    ####How to use
    1. edit configuration.h & main.cpp if needed: DO NOT remove template items
    2. run the following command:
      ```
        node firmware_builder
      ```
    3. check the resulting firmware (all files are in a single folder)
    3. upload the resulting firmware to your ESP8266

##various thoughts on UI:

    Needs:
    - access to multiple "nodes"/locations
    - zoom/pan for longer data series
    - possibility to split & merge data from different sensors & location (for cross
    referencing "events" at a given time, across sensors)
