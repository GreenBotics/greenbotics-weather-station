import {of, head, flatten} from 'ramda'
import {makeParams} from '../utils'
import {makeWraps} from '../wrappers'


export default function aquariumEdgeTubingHolder(options){
  const {
    cube, sphere, cylinder, 
    square, circle, 
    hull, chain_hull, union, difference, 
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

  const DEFAULTS = {
      height:30
    , width:30
    , glassThickness:5
    , wallsThickness:3
    , topThickness:5

    , tubeDia:16
    , tubeToWalls:3.5
    , tubeClearance:0.1

    , ribsOffsets:[10]
  }
  
  function addComputedParams(options){
    const innerOffset   = options.glassThickness + 2 * options.wallsThickness

    const tubeOffset  = options.tubeToWalls + innerOffset + options.tubeDia/2 //+7  //+ options.glassThickness//offset of center of tubing compared to aquarium inner corner
    const length      = tubeOffset + options.tubeDia /2 +5

    const innerLength   = length - innerOffset//how much is "after" the walls etc

    let computed   = {
      tubeOffset
      ,length 
      ,innerLength
      ,innerOffset
     }
    return computed
  }

  //get our resulting params
  let {
      height
    , length
    , width
    , glassThickness
    , wallsThickness
    , topThickness
    , innerLength
    , innerOffset

    , tubeDia
    , tubeOffset
    , tubeClearance

    , ribsOffsets

  } =  makeParams(options, DEFAULTS, addComputedParams)

  //////////////////
  //parts
  const tubeHole    = cylinder({d:tubeDia+tubeClearance, h:height})
    .map(translate([0,tubeOffset,0]))

  const backWall  = cube({size:[width,wallsThickness,height],center:[true, false, false]})
  const frontWall = cube({size:[width,wallsThickness,height],center:[true, false, false]})
    .map(translate([0,glassThickness+wallsThickness,0]))
  const verticalWalls = union(backWall, frontWall)

  const ribs = ribsOffsets
    .map(function(offset){
      return cube({size:[width,innerLength,topThickness],center:[true, true, false]})
        .map(translate([0,innerLength/2+innerOffset,offset-topThickness]))
    })

  const topWall   = cube({size:[width,length,topThickness],center:[true, true, false]})
    .map(translate([0,length/2,height-topThickness]))
    
  const result = union( verticalWalls, topWall, tubeHole, ribs )
    .map(r=>difference(r,tubeHole))


  return flatten( result )
  
}