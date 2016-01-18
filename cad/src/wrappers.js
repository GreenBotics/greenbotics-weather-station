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


  //needs to be specifically overloaded (for now)
  function torus(p) {
    var ri = 1, ro = 4, fni = 16, fno = 32, roti = 0;
    if(p) {
      if(p.ri) ri = p.ri;
      if(p.fni) fni = p.fni;
      if(p.roti) roti = p.roti;
      if(p.ro) ro = p.ro;
      if(p.fno) fno = p.fno;
    }
    if(fni<3) fni = 3;
    if(fno<3) fno = 3;
    var c = _oldCircle({r:ri,fn:fni,center:true});
    if(roti) c = c.rotateZ(roti);
    return rotate_extrude({fn:fno},c.translate([ro,0,0]));
  }
  let _oldTorus = torus
  torus = wrap(_oldTorus)

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

  let _oldIntersect = intersection
  intersection = spreadWrap( _oldIntersect )

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
    cube, sphere, cylinder, torus,
    square, circle,  
    hull, chain_hull, union, difference, intersection,
    translate, rotate, mirror
  }

}

//console.log("sphereEEEE",spheren)
