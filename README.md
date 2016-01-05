# GreenSkies


> Open source, somewhat low cost Weather station project



## Infos so far:


- temperature, humidity, barometric pressure sensor : BME180 
- anemometer (wind speed) hall effect sensor

- remote  but not too much (garden based) : using a ESP8266 as "brain" + network
- low power as much as possible + solar powered if possible



## various thoughts on UI:

Needs:
- access to multiple "nodes"/locations
- zoom/pan for longer data series
- possibility to split & merge data from different sensors & location (for cross
referencing "events" at a given time, across sensors)


## Cad

Using OpenJSCad + Es6 + Ramda 

very roughly it uses browserify + babel 


  ```npm run watch```


then drag & drop cad/out/index.jscad.js into openjscad

