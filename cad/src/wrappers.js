import {of, head, flatten} from 'ramda'


function wrap(type){
  return function(options){
    return of(type(options))
  }
}

function spreadWrap(type){
  return function(...options){
    return of(type(flatten(options)))
  }
}



export function makeWraps(){
  let _oldSPhere = sphere
  sphere = wrap(_oldSPhere)

  let _oldCylinder = cylinder
  cylinder = wrap(_oldCylinder)

  let _oldSquare = square
  square = wrap(_oldSquare)

  let _oldCircle = circle
  circle = wrap(_oldCircle)

  let _oldHull = hull
  hull = spreadWrap(_oldHull)

  let _oldUnion = union
  union = spreadWrap( _oldUnion )

  let _oldDifference = difference
  difference = spreadWrap( _oldDifference )

  return {
    sphere, cylinder, square, circle,  hull, union, difference
  }

}

//console.log("sphereEEEE",spheren)
