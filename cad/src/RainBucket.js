import {of, head, flatten} from 'ramda'
import {applyDefaults} from './utils'


export default function RainBucket(options){
  const DEFAULTS = {
    h: 20
    ,d: 30
    ,walls: 3
    ,outD:2 //outflow hole dia

    ,fn:50
    ,mountHoleD:3//diameter of mount holes
  }

  options =  of(options || {})
    .map( o => applyDefaults(o, DEFAULTS) )
    //.map( addComputedParams )
    //.map( validateParams )


  let {d, h, walls, outD, mountHoleD, fn} = options
  //h = 50, r1 = 20, r2 = 5, center = true
  let id           = d - walls
  let minId        = outD
  let bottomOffset = 10

  let mountHoles = []
  //cylinder({h,d:outD})

  return difference(
    cylinder({h,d})

    ,cylinder({h:h ,d2:id, d1:minId, fn ,center:true })
    
    ,cylinder({h,d:outD})
  )
}