const mqtt = require('mqtt')
  // Make sure to change this to the IP address of your MQTT server
  , host = 'localhost' //'192.168.1.204' // or localhost
  
const client  = mqtt.connect( { host: 'localhost', port: 1883 } )
//client = mqtt.createClient(1883, host, {keepalive: 10000})

// Subscribe to the temperature topic
client.subscribe('sensorData')
client.subscribe('nodeOnline')


client.on('connect', function () {

  setInterval(function(){
    client.publish('inTopic', 'Foo node')
  },10000)

})

// When a temperature is published, it will show up here
client.on('message', function (topic, message) {
  console.log("Got a message!", topic, message.toString())
})

