// title      : Test
// author     : Mark Moissette
// license    : MIT License
// tags       : 
// file       : test.jscad

import {of, head, flatten} from 'ramda'

import WindVane from './WindVane'
import RainBucket from './RainBucket'
import Anemometer from './Anemometer'
import StephensonScreen from './StephensonScreen'
import doorHolder from './SlidingDoor/doorHolder'

//from http://stackoverflow.com/questions/27266550/how-to-flatten-nested-array-in-javascript
//temporary replacement for most/ramda "flatten" until we solve the import issues
/*function flatten(array, mutable) {
    var toString = Object.prototype.toString;
    var arrayTypeStr = '[object Array]';

    var result = [];
    var nodes = (mutable && array) || array.slice();
    var node;

    if (!array.length) {
        return result;
    }

    node = nodes.pop();

    do {
        if (toString.call(node) === arrayTypeStr) {
            nodes.push.apply(nodes, node);
        } else {
            result.push(node);
        }
    } while (nodes.length && (node = nodes.pop()) !== undefined);

    result.reverse(); // we reverse result to restore the original order
    return result;
}*/

//temporary replacement for most/ramda "of" until we solve the import issues
/*function of(data){
  if(!data) return []
  if(data.constructor !== Array) return [data]
  return data
}*/

//temporary replacement for most/ramda "head" until we solve the import issues
/*function head(data){
  if(!data) return undefined
  if(data.length && data.length === 0) return undefined
  if(data.length && data.length>0) return data[0]
}*/
///////////////////////////////


function main() {
  let res = 50

  //let windVane   = WindVane()
  //let rainBucket = RainBucket()
  //let anemometer = Anemometer()
  //let stephensonScreen = StephensonScreen()

  let doorHolder1 = doorHolder()

  //return anemometer
  //return rainBucket
  //return windVane
  //return stephensonScreen

  return doorHolder1
}

if(typeof module !== 'undefined'){
  module.exports = main
}
console.log("Done")

