import {of, head, flatten, pipe} from 'ramda'
import {applyDefaults} from './utils'
import {makeWraps} from './wrappers'


export default function WindBody(options){
  const {
    cube, sphere, cylinder, 
    square, circle, 
    hull, chain_hull, union, difference, 
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

  const DEFAULTS = {
    height:100
    ,axisDia:8,axisHeight:8,axisOd:12
  }

  options =  of(options || {})
    .map( o => applyDefaults(o, DEFAULTS) )
    .map( addComputedParams )
    //.map( validateParams )

  function addComputedParams(options){
    let computed = {}
    options = Object.assign({}, options, computed)
    return options
  }

  const {
    height,
    axisDia, axisHeight, axisOd
    } = head(options)

  const body  = cylinder({})
  const axisHole  = cylinder({d:axisDia,h:axisHeight})
  

  const result = difference( 
    body
    , axisHole
  )
  return flatten(result)
 
}