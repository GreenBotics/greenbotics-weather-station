import {of, head, flatten} from 'ramda'
import {makeParams} from './utils'
import {makeWraps} from './wrappers'


export default function WindVane(options){
  const {
    cube, sphere, cylinder, 
    square, circle, 
    hull, chain_hull, union, difference, 
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

  const DEFAULTS = {
    l: 120//length
    ,w: 20//width
    ,h:20//height

    ,mainDia: 8

    ,bodyDia: 8
    ,axisDiaID: 5
    ,axisDiaOD: 15
    ,axisHeight:10

    ,headWidth : 20
    ,headLength: 20//within the overall length

    ,tailWidth : 25
    ,tailLength: 30
    ,tailThickness:2
  }
  //
  //experiment
  
  function addComputedParams(options){
    let bodyLength = options.l - options.headLength
    let computed   = {bodyLength}
    return computed
  }

  //get our resulting params
  let {l,w,h, 
    mainDia, bodyDia, bodyLength,
    axisDiaID, axisDiaOD, axisHeight, 
    headWidth, headLength,
    tailWidth, tailLength, tailThickness
  } =  makeParams(options, DEFAULTS, addComputedParams)

  //////////////////
  //parts
 
  const center = sphere({r:axisDiaOD/2}) //not dia support for sphere?

  const arrowHead = cylinder({h:headLength,d1:headWidth,d2:0,fn:4})
    .map( rotate( [0, 90, 0] ) )
    .map( translate([bodyLength/2  ,0,0]) )
  
  const body = cylinder({h:bodyLength ,d:bodyDia, center:true })
    .map( rotate( [0, 90, 0] ) )

  const tail = hull( 
      square({size:[tailWidth,2]}) 
      , translate( [0,-tailWidth], circle({r:5}) )
      , translate( [-2,-tailLength], circle({r:0.4}) )
    ) 
    .map( t => linear_extrude({ height: tailThickness }, t) )
    .map( translate([-bodyLength/2, -bodyDia/2 , - tailThickness/2]) )

  //holes
  const cutoff = cube({size:[l,headWidth,20],center:true})
    .map( translate([headLength/2,headWidth/2,0]) )//bottom cut

  const mountHole = cylinder({h:axisDiaOD,d:axisDiaID})//center cut 
    .map( rotate( [90,0,0] ) )

  const result = union( body, arrowHead, center, tail )
    .map( result => difference( result ,cutoff ,mountHole ) )
    .map( rotate( [-90,0,0] ) )

  return flatten( result )
  
}