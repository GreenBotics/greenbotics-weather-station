import {of, head, flatten, pipe} from 'ramda'
import {applyDefaults} from './utils'
import {makeWraps} from './wrappers'


function Cup(options){
  const {
    cube, sphere, cylinder, 
    square, circle, 
    hull, chain_hull, union, difference, 
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

   const DEFAULTS = {
    od:20
    ,shape:"sphere"
    ,walls:3
    ,fn:32
  }

  function addComputedParams(options){
    const id = options.od - options.walls
    let computed = {id}
    options = Object.assign({}, options, computed)
    return options
  }

  options =  of(options || {})
    .map( o => applyDefaults(o, DEFAULTS) )
    .map( addComputedParams )

  const {od, id, walls, shape, fn} = head(options)


  if(shape === "sphere"){
    return difference(
      sphere({r:od/2, center:true, fn})
      ,sphere({r:id/2 ,center:true, fn})
      ,cube({size:[od,od,od],center:[false,true,true]})
        //.map(translate([0,5,0]))
    )
  }
  else{
    return difference(
      cylinder({d1:od  ,d2:id ,h:30, center:true, fn})
      ,cylinder({d1:od-walls ,d2:id-walls ,h:30, center:true, fn})
    )

  }
 

}

export default function Anemometer(options){
  const {
    cube, sphere, cylinder, 
    square, circle, 
    hull, chain_hull, union, difference, 
    translate, rotate, mirror} = makeWraps()//hack for now, this NEEDS to be done in the context of this function , otherwise the origin "sphere, cylinder etc are not defined"

  const DEFAULTS = {
    cupCount:3,cupOffset:50,cupOd:50,cupWalls:3
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
    cupCount, cupOffset, cupOd, cupWalls
    ,axisDia, axisHeight, axisOd
    } = head(options)

  const cups = Array(cupCount).fill(0)
    .map(e=>Cup({od:cupOd, walls:cupWalls, shape:"sphere"}))
    //.map(mirror([1,0,0]))
    .map(rotate([0,0,60]))
    .map(translate([cupOffset,0,0]))
    .map((cup,index)=>rotate([0,0,(360/cupCount)*index],cup))

  //alternative approach
  /*let cupTransforms = pipe(
      Cup
      ,rotate([0,0,60])
      ,translate([cupOffset,0,0])
      //,(cup,index)=>rotate([0,0,(360/cupCount)*index],cup)
    )
  const cups2 = cupTransforms( Array(cupCount).fill(0) )
  console.log("cups2", cupTransforms,cups2)*/

  const axisHole  = cylinder({d:axisDia,h:axisHeight})
  const axisBlock = //chain_hull(
    cylinder({d:axisOd,h:axisHeight})
    //)

 
  const result = difference( union( cups, axisBlock )
    , axisHole
  )
  return flatten(result)
 
}