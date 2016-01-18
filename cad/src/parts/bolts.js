import {of, head, flatten} from 'ramda'
import {makeParams} from '../utils'
import {makeWraps} from '../wrappers'


export default function bolt(options){
  const {
    cube, sphere, cylinder, 
    square, circle, 
    hull, chain_hull, union, difference, 
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

  const DEFAULTS = {
    d:3
    h:10
    ,hole:false
  }
  
  function addComputedParams(options){

    let computed   = {}
    return computed
  }

  //get our resulting params
  let {
    d
    ,h
  } =  makeParams(options, DEFAULTS, addComputedParams)

  //////////////////
  
  const body = cylinder({d,h})
    
  const result = union( body )

  return flatten( result )
  
}