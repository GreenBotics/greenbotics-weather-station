import {of, head, flatten, pipe} from 'ramda'
import {makeParams} from './utils'
import {makeWraps} from './wrappers'


export default function StephensonScreen(options){
  const {
    cube, sphere, cylinder, torus, 
    square, circle, 
    hull, chain_hull, union, difference, intersection,
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

   const DEFAULTS = {
    od:50
    ,height:15
    ,shape:"sphere"
    ,walls:3
    ,centerOd:25
    ,pillarsCount:4, pillarsDia:6, pillarJoinerThickness:2
    ,fn:32
  }

  function addComputedParams(options){
    const id = options.od - options.walls
    return {id}
  }

  const {
    od, id, 
    walls, height, 
    centerOd,
    pillarsCount, pillarsDia, pillarJoinerThickness,
    shape, fn} = makeParams(options, DEFAULTS, addComputedParams)

  if(shape === "sphere"){
    const pillars = Array(pillarsCount).fill(0)
      .map( e => cylinder({d:pillarsDia, h:height}) )
      .map( translate([od/4+3,0,0]) )
      .map( (e,i)=> rotate([0,0,i*(360/pillarsCount)],e) )

    const pillarJoiners =  Array(pillarsCount).fill()
      .map( e=> cube({size:[pillarJoinerThickness,od/2,height], center:[true,false,false]}) )
      .map( (e,i)=> rotate([0,0,i*(360/pillarsCount)],e) )

    const segment = difference(
      sphere({r:od/2, center:true, fn})
      ,sphere({r:id/2 ,center:true, fn})
      //torus({ro:od/2, ri:3, fno:fn})
      ,cube({size:[od,od,od],center:[true,true,false]})
        .map(translate([0,0,-od]))
      ,cube({size:[od,od,od],center:[true,true,false]})
        .map(translate([0,0,height]))
      ,cylinder({h:height,d:centerOd})//center hole
    ).map(e=> union( e, torus({ro:od/2-walls/3, fno:fn}) ) )   

    const results = union( segment, pillars, pillarJoiners )
      .map( e=> intersection( e, sphere({r:od/2, center:true, fn}) ) )
      

    return flatten(results)
  }
  /*else{
    return difference(
      cylinder({d1:od  ,d2:id ,h:30, center:true, fn})
      ,cylinder({d1:od-walls ,d2:id-walls ,h:30, center:true, fn})
    )
  }*/
}