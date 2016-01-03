import {of, head, flatten} from 'ramda'
import {applyDefaults} from './utils'
import {makeWraps} from './wrappers'


export default function RainBucket(options){
  const {
    cube, sphere, cylinder, 
    square, circle, 
    hull, chain_hull, union, difference, 
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

  const DEFAULTS = {
    h: 50
    ,od: 70
    ,walls: 3
    ,outputDia:2 //outflow hole dia

    ,fn:50
    ,mountHoleDia:3//diameter of mount holes
    ,mountHoleBlockHeight:10
    ,funelWalls:2 //how thick shoud the funel's walls be

    ,bottomOffset:10
  }

  options =  of(options || {})
    .map( o => applyDefaults(o, DEFAULTS) )
    .map( addComputedParams )
    //.map( validateParams )

  function addComputedParams(options){
    const id           = options.od - options.walls
    const funelEndDia = options.outputDia + options.funelWalls

    let computed = {id, funelEndDia}
    options = Object.assign({}, options, computed)
    return options
  }


  const {
    od, id, h, walls
    ,bottomOffset
    ,outputDia
    ,funelEndDia, funelWalls
    ,mountHolesDia, fn} = head(options)

  //funnel
  const funnelInner = cylinder({h:h ,d2:od, d1:funelEndDia, fn })
    .map( translate([0,0,funelWalls]) )   //e => translate([0,0,funelWalls],e) )
   
  const funel = cylinder({h:h ,d2:od, d1:funelEndDia, fn })
    .map( e => difference( e, funnelInner ) )

  //output hole
  const outputHole = cylinder({h,d:outputDia})

  //container
  const container = difference( cylinder({h,d:od}), cylinder({h,d:id}) )

  //mount points
  const mountHoleOffsets = []
  //cylinder({h,d:outD})
  //cube({size:[5,5,mountHoleBlockHeight]})

  const result = difference( union( funel, container ) , outputHole )

  return flatten(result)
 
}