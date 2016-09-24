const ramda = require('ramda')
const {uniq, flatten} = ramda

const fs = require('fs')
const path = require('path')

const sensors = []
const sensorTypes = ['temperature', 'humidity', 'pressure', 'distance']
const envDataTypes = ['temperature', 'humidity', 'atmopressure', '']

const sensorModels = {
  'BME280': 'Adafruit_BME280',
  'SI1145': 'Adafruit_SI1145'
}

const sensorCaps = {
  'BME280': ['temperature', 'humidity', 'baro'],
  'SI1145': ['v', 'uv', 'ir']
}

const sensorDeclarationCode = {
  'BME280': 'Adafruit_BME280 bme; // I2C',
  'SI1145': 'Adafruit_SI1145 uv = Adafruit_SI1145();//I2C too'

}

const sensorSetupCode = {
  'BME280': `while( !bme.begin() ) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!")
    myDelay(1000)
  }`,
  'SI1145': `while( !uv.begin() ) {
    Serial.println("Didn't find Si1145")
    myDelay(1000)
  }`
}

const sensorReadCode = {
  'BME280': {
    'temperature': 'bme.readTemperature();',
    'baro': 'bme.readPressure() / 100.0F;',
    'humidity': 'bme.readHumidity();'
  }, 'SI1145': {
    'v': 'uv.readVisible();',
    'uv': 'uv.readIR();',
    'ir': 'uv.readUV();'
  }
}

// //////////////////////////////////
// what a user would actually specify
const mySensors = [
  'BME280'
// ,'SI1145'
]

const myComs = [
  'rest'
]

// not sure how to deal with sensors containing...sensors
const mySensors2 = {
  'BME280': ['temperature', 'humidity'],
  'SI1145': ['v']
}

function mkdirSync (path) {
  try {
    fs.mkdirSync(path)
  } catch(e) {
    if (e.code != 'EEXIST') throw e
  }
}

/*
  function process hash of basic options & list of "sensors" to generate correctly
  working firmware code for arduino/esp8266

  Note : tested and working with Olimex 8266 https://www.olimex.com/Products/IoT/MOD-WIFI-ESP8266-DEV/
*/
function build (sensors) {
  const code = sensors.map(function (sensor, sensorIndex) {
    const modelImport = sensorModels[sensor]

    const declaration = sensorCaps[sensor]
      .map(function (type, index) {
        return `float ${type}_${sensorIndex} = 0;`
      })

    const initComs = sensorCaps[sensor]
      .map(function (type, index) {
        return `rest.variable("${type}",&${type}_${sensorIndex});`
      })

    const sensorSetup = sensorSetupCode[sensor]
    const sensorDeclaration = sensorDeclarationCode[sensor]

    const read = sensorCaps[sensor]
      .map(function (type, index) {
        const readCode = sensorReadCode[sensor][type]
        return `${type}_${sensorIndex} = ${readCode}`
      })

    const imports = `#include <${modelImport}.h>`

    // console.log("declaration",declaration, "read",read)
    return {imports, initComs, sensorSetup, sensorDeclaration, declaration, read}
  })

  const imports = uniq(code.map(data => data.imports)).join('\n') + '\n'
  const initComs = flatten(code.map(data => data.initComs)).join('\n') + '\n'
  const sensorSetups = uniq(code.map(data => data.sensorSetup)).join('\n') + '\n'
  const sensorDeclarations = uniq(code.map(data => data.sensorDeclaration)).join('\n') + '\n'

  const declarations = flatten(code.map(data => data.declaration)).join('\n') + '\n'
  const readSensors = flatten(code.map(data => data.read)).join('\n') + '\n'

  /*console.log("imports",imports)
  console.log("initComss",inits)
  console.log("declaration",declaration)
  console.log("read", read)*/

  function format (string, _args) {
    /*return string.replace(/\$\{p(\d)\}/g, function(match, id) {
      console.log("match",match, id)
        return args[id]
    });*/
    // console.log("string",string,"_args",_args)

    return Object.keys(_args)
      .reduce(function (text, key) {
        const pattern = '\\$\{' + key + '\}' // '/\$\{'+ key +'\}/g'
        const replacement = _args[key]
        // console.log("pattern",pattern,"replacement",replacement,"text",text)

        return text.replace(new RegExp(pattern, 'g'), replacement)
      }, string)
  }

  const params = {
    node_id: 0,
    node_name: 'GreenSkies_Node0',
    ssid: 'FOO',
    password: 'BAR',
    in_port: 3020,
    ip: [192, 168, 1, 22],
    gateway: [192, 168, 1, 1],
    subnet: [255, 255, 255, 0]
  }

  const configTpl = fs.readFileSync(path.resolve(__dirname, './templates/configuration.h'), 'UTF8')
  const configTxt = format(configTpl, params)

  const mainTpl = fs.readFileSync(path.resolve(__dirname, './templates/main.cpp'), 'UTF8')
  const fullParams = Object.assign({}, params, {imports, declarations, sensorSetups, sensorDeclarations, initComs, readSensors})
  const mainTxt = format(mainTpl, fullParams)

  const firmwareName = 'greenskies'
  mkdirSync(firmwareName)
  fs.writeFileSync(`${firmwareName}/configuration.h`, configTxt, 'utf8')
  fs.writeFileSync(`${firmwareName}/${firmwareName}.ino`, mainTxt, 'utf8')
}

build(mySensors)
