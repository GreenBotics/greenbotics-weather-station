// title      : Test
// author     : Mark Moissette
// license    : MIT License
// tags       : 
// file       : test.jscad

//from http://stackoverflow.com/questions/27266550/how-to-flatten-nested-array-in-javascript
function flatten(array, mutable) {
    var toString = Object.prototype.toString;
    var arrayTypeStr = '[object Array]';

    var result = [];
    var nodes = (mutable && array) || array.slice();
    var node;

    if (!array.length) {
        return result;
    }

    node = nodes.pop();

    do {
        if (toString.call(node) === arrayTypeStr) {
            nodes.push.apply(nodes, node);
        } else {
            result.push(node);
        }
    } while (nodes.length && (node = nodes.pop()) !== undefined);

    result.reverse(); // we reverse result to restore the original order
    return result;
}

function Arrow(options){
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

  options = Object.assign({}, DEFAULTS, options)

  let {l,w,h, 
    mainDia, bodyDia, 
    axisDiaID, axisDiaOD, axisHeight, 
    headWidth, headLength,
    tailWidth, tailLength, tailThickness
  } = options

  let bodyLength = l - headLength
 

  //parts
  let center = [ sphere({r:axisDiaOD/2}) ]//not dia support for sphere?

  let head = [ cylinder({h:headLength,d1:headWidth,d2:0,fn:4}) ]
    .map( h => rotate( [0, 90, 0], h ) )
    .map( h => translate([bodyLength/2  ,0,0], h) )
  
  let body = [ cylinder({h:bodyLength ,d:bodyDia, center:true }) ]
    .map( b => rotate( [0, 90, 0], b ) )

  let tail = [
    hull( 
      square({size:[tailWidth,2]}) 
      , translate( [0,-tailWidth], circle({r:5}) )
      , translate( [-2,-tailLength], circle({r:0.4}) )
    ) ]
    .map( t => linear_extrude({ height: tailThickness }, t) )
    .map( t => translate([-bodyLength/2, -bodyDia/2 , - tailThickness/2],t) )

  //holes
  let cutoff = cube({size:[l,headWidth,20],center:true})
    .translate([headLength/2,headWidth/2,0])//bottom cut

  let mountHole = [ cylinder({h:axisDiaOD,d:axisDiaID}) ]//center cut 
    .map(e => rotate([90,0,0], e) )

  let result = union( flatten( [ body, head, center, tail] ) )

  return rotate( [-90,0,0],
    difference( flatten( [ result ,cutoff ,mountHole] ) )
  )
  
}

function RainBucket(options){
  const DEFAULTS = {
    h: 20
    ,d: 30
    ,walls: 3
    ,outD:2 //outflow hole dia

    ,fn:50
    ,mountHoleD:3//diameter of mount holes
  }
  options = Object.assign({}, DEFAULTS, options)

  let {d, h, walls, outD, mountHoleD, fn} = options
  //h = 50, r1 = 20, r2 = 5, center = true
  let id           = d - walls
  let minId        = outD
  let bottomOffset = 10


  let mountHoles = []
  //cylinder({h,d:outD})

  return difference(
    cylinder({h,d})

    ,cylinder({h:h ,d2:id, d1:minId, fn ,center:true })
    
    ,cylinder({h,d:outD})
  )
}

function main() {
  let res = 50

  let arrow   = Arrow()
  let rainBucket = RainBucket()

  /*return union(
      difference(
         cube({size: 3, center: true}),
         sphere({r:2, center: true, fn:res})
      ),
      intersection(
          sphere({r: 1.3, center: true, fn: res, type:'geodesic'}),
          cube({size: 5.1, center: true})
      )
   ).translate([0,0,1.5]).scale(10)*/
  return arrow
}

console.log("Done")

