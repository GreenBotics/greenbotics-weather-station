// Pulled directly from the MQTT example folder
// https://github.com/adamvr/MQTT.js/blob/master/examples/server/broadcast.js
var mqtt = require('mqtt'),
  util = require('util')

mqtt.createServer(function (client) {
  var self = this

  if (!self.clients) self.clients = {}

  client.on('connect', function (packet) {
    self.clients[packet.clientId] = client
    client.id = packet.clientId
    console.log('client connected!', client.id)
    client.subscriptions = []
    client.connack({returnCode: 0})
  })

  client.on('subscribe', function (packet) {
    var granted = []

    for (var i = 0; i < packet.subscriptions.length; i++) {
      var qos = packet.subscriptions[i].qos,
        topic = packet.subscriptions[i].topic,
        reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$')

      granted.push(qos)
      client.subscriptions.push(reg)
    }

    client.suback({messageId: packet.messageId, granted: granted})
  })

  client.on('publish', function (packet) {
    for (var k in self.clients) {
      var c = self.clients[k]

      for (var i = 0; i < c.subscriptions.length; i++) {
        var s = c.subscriptions[i]

        if (s.test(packet.topic)) {
          c.publish({topic: packet.topic, payload: packet.payload})
          break
        }
      }
    }
  })

  client.on('message', function (topic, message) {
    console.log('recieved message', topic, message)
  })

  client.on('pingreq', function (packet) {
    client.pingresp()
  })

  client.on('disconnect', function (packet) {
    client.stream.end()
  })

  client.on('close', function (packet) {
    delete self.clients[client.id]
  })

  client.on('error', function (e) {
    client.stream.end()
    console.log(e)
  })
}).listen(process.argv[2] || 1883)

console.log('listening for clients!')
