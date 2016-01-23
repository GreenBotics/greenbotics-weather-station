import {of, head, flatten} from 'ramda'
import {makeParams} from '../../utils'
import {makeWraps} from '../../wrappers'


export default function doorHolder(options){
  const {
    cube, sphere, cylinder, 
    square, circle, 
    hull, chain_hull, union, difference, 
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

  const DEFAULTS = {
    mountBlockLength : 30
    ,mountBlockWidth : 18
    ,mountBlockThickness: 6

    ,mountBoltDia : 3
    ,mountBoltOffsetX:12//along width
    ,mountBoltOffsetY:24
    ,axisBoltDia  :4

    ,frontArmLength: 20
    ,frontArmWidth: 30//width
    ,frontArmThickness:3

    ,bearingHeight:5
    ,bearingCleareance:1.5//this is /2 , ie half for each side
  }
  
  function addComputedParams(options){
    const armOffset = options.mountBlockThickness+options.bearingHeight+options.bearingCleareance//4 + options.bearingHeight+ options.frontArmThickness/2 

    let computed   = {
      axisBoltHeadOd:7.0//5.7
      , axisBoltHeadHeight:4//3
      , armOffset}
    return computed
  }

  //get our resulting params
  let {
    mountBlockLength
    ,mountBlockWidth
    ,mountBlockThickness 

    ,mountBoltDia
    ,mountBoltOffsetX
    ,mountBoltOffsetY

    ,axisBoltDia
    ,axisBoltHeadOd
    ,axisBoltHeadHeight


    ,frontArmLength
    ,frontArmWidth
    ,frontArmThickness

    ,armOffset
    ,bearingHeight
    ,bearingCleareance

  } =  makeParams(options, DEFAULTS, addComputedParams)

  //////////////////
  //parts

  //front arm , to help hold the door in place
  
  const fAMP1Length    = 4
  const fAMP1Width     = 10
  const frontArmMountP1 = cube({size:[fAMP1Width,fAMP1Length,armOffset],center:[false, false, false]})
    .map(translate([0,frontArmWidth/2 -fAMP1Length ,-armOffset]))
  
  const fAMP2Length    = 9
  const fAMP2Width     = 10
  const fAMP2Thickness = axisBoltHeadHeight
  const frontArmMountP2  = cube({size:[fAMP2Width,fAMP2Length, fAMP2Thickness],center:[false, false, false]})
    .map(translate([0,frontArmWidth/2 -fAMP1Length-fAMP2Length,-armOffset]))

  const fAMP3Length = 18
  const fAMP3Width  = 3
  const fAMP3Thickness = 4
  const frontArmMountP3  = cube({size:[fAMP3Width,fAMP3Length, fAMP3Thickness],center:[false, false, false]})
    .map(translate([0,frontArmWidth/2 -fAMP1Length-fAMP3Length,-armOffset]))

  //cut
  const fAMP4Length = 18
  const fAMP4Width  = 2
  const fAMP4Thickness = 4
  const frontArmMountNotch  = cube({size:[fAMP4Width,fAMP4Length, fAMP4Thickness],center:[false, false, false]})
    .map(translate([4,frontArmWidth/2 -fAMP1Length-fAMP4Length,-armOffset]))

  const frontArmMount = union(frontArmMountP1, frontArmMountP2, frontArmMountP3)
    .map(e=>difference(e,frontArmMountNotch))


  const frontArm = cube({size:[frontArmLength, frontArmWidth, frontArmThickness],center:[false,true,false]})
    .map(arm => union( arm, frontArmMount ) )
    .map(translate([-mountBlockWidth/2,0,armOffset]))
    .map(e=>color([0,0,1],e))

  //main mounting block
  const frontArmMountHole = frontArmMount
    .map(translate([-mountBlockWidth/2,(mountBlockLength- frontArmWidth)/2,armOffset]))

  const axisBoltHoleTop    = cylinder({d:axisBoltDia, h:mountBlockThickness})
  const axisBoltHoleBottom = cylinder({d:axisBoltHeadOd, h:axisBoltHeadHeight}) 
  const axisBoltHolesTunel = union(axisBoltHoleTop, axisBoltHoleBottom)

  const axisBoltHoleSideTop     = cube({size:[axisBoltHeadOd, mountBlockLength/2, axisBoltHeadHeight],center:[true,false,false]})
  const axisBoltHoleSideBottom  = cube({size:[axisBoltDia, mountBlockLength/2 , mountBlockThickness],center:[true,false,false]})
  const axisBoltHolesCanal = union(axisBoltHoleSideTop, axisBoltHoleSideBottom)

  const mountBoltCount = 2
  const mountBoltHoles = [-1,1]
    .map(o=> translate([o*(mountBoltOffsetX/2),o*mountBoltOffsetY/2,0], cylinder({d:mountBoltDia,h:mountBlockThickness}) ) )

  const mountBlock = cube({size:[mountBlockWidth,mountBlockLength,mountBlockThickness],center:[true,true,false]})
    .map(block => difference(block, axisBoltHolesTunel, axisBoltHolesCanal , mountBoltHoles, frontArmMountHole) )


  //just for visual helping
  const bearing = cylinder({d:13,h:bearingHeight})
    .map(translate([0,0,mountBlockThickness+bearingCleareance/2]))
    .map(e=>color([1,0,0],e))
    
  const result = union( mountBlock, bearing, frontArm )

  return flatten( result )
  
}