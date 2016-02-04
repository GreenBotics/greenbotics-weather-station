import {of, head, flatten} from 'ramda'
import {makeParams} from '../utils'
import {makeWraps} from '../wrappers'

export default function tubeCap(options){
  const {
    cube, sphere, cylinder, 
    square, circle, 
    hull, chain_hull, union, difference, 
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

  const DEFAULTS = {
      length:12
    , wallsThickness:3
    , endThickness:2

    , tubeDia:16
    , tubeClearance:0.1

  }
  
  function addComputedParams(options){
    let computed   = {
        tubeOd:options.tubeDia + options.wallsThickness *2
     }
    return computed
  }

  //get our resulting params
  let {
      length
    , wallsThickness
    , endThickness

    , tubeDia
    , tubeOd
    , tubeClearance

  } =  makeParams(options, DEFAULTS, addComputedParams)

  //////////////////
  //parts
  const capHole    = cylinder({d:tubeDia+tubeClearance, h:length, fn:64})
    .map(translate([0,0,endThickness]))

  const capTube   = cylinder({d:tubeOd, h:length, fn:64})
    
  const result = union( capTube )
    .map(r=>difference(r,capHole))

  return flatten( result )  
}