import {of, head, flatten, curry, compose} from 'ramda'


/*let greaterThan = curry( (limit, value) => value > limit )

let greaterThanTwentyFive = greaterThan(25)
console.log("A",greaterThan(25,20))
console.log("B",greaterThanTwentyFive(26))*/


/*let transforms = compose(
  translate([20,10,5])
)*/

////

function wrap(type){
  return function(options){
    return of(type(options))
  }
}

function spreadWrap(type){
  return function(...options){
    return flatten( of(type(flatten(options))) )
  }
}

export function makeWraps(){
  let _oldCube  = cube
  cube   = wrap(_oldCube)

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

  let _oldChainHull = chain_hull
  chain_hull = spreadWrap(_oldChainHull)

  //booleans
  let _oldUnion = union
  union = spreadWrap( _oldUnion )

  let _oldDifference = difference
  difference = spreadWrap( _oldDifference )

  //transforms
  let _oldTranslate = translate
  translate = curry( function(transform, operands){
    //console.log("transform",transform, operands)
    let ops = flatten( of(operands) )
    return of( _oldTranslate( transform, ...ops ) )
  } )

  let _oldRotate = rotate
  rotate = curry( function(transform, operands){
    //console.log("transform",transform, operands)
    let ops = flatten( of(operands) )
    return of( _oldRotate( transform, ...ops ) )
  } )


  let _oldMirror = mirror
  mirror = curry( function(transform, operands){
    //console.log("transform",transform, operands)
    let ops = flatten( of(operands) )
    return of( _oldMirror( transform, ...ops ) )
  } )

  //curry( (transform, ...operands) => _oldTranslate(transform,operands) )


  return {
    cube, sphere, cylinder, 
    square, circle,  
    hull, chain_hull, union, difference, 
    translate, rotate, mirror
  }

}

//console.log("sphereEEEE",spheren)
