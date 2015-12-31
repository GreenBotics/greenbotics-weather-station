

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
  var nodes = mutable && array || array.slice();
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

function Arrow(options) {
  var DEFAULTS = {
    l: 120 //length
    , w: 20 //width
    , h: 20 //height

    , mainDia: 8,

    bodyDia: 8,
    axisDiaID: 5,
    axisDiaOD: 15,
    axisHeight: 10,

    headWidth: 20,
    headLength: 20 //within the overall length

    , tailWidth: 25,
    tailLength: 30,
    tailThickness: 2
  };

  options = Object.assign({}, DEFAULTS, options);

  var _options = options;
  var l = _options.l;
  var w = _options.w;
  var h = _options.h;
  var mainDia = _options.mainDia;
  var bodyDia = _options.bodyDia;
  var axisDiaID = _options.axisDiaID;
  var axisDiaOD = _options.axisDiaOD;
  var axisHeight = _options.axisHeight;
  var headWidth = _options.headWidth;
  var headLength = _options.headLength;
  var tailWidth = _options.tailWidth;
  var tailLength = _options.tailLength;
  var tailThickness = _options.tailThickness;

  var bodyLength = l - headLength;

  //parts
  var center = [sphere({ r: axisDiaOD / 2 })]; //not dia support for sphere?

  var head = [cylinder({ h: headLength, d1: headWidth, d2: 0, fn: 4 })].map(function (h) {
    return rotate([0, 90, 0], h);
  }).map(function (h) {
    return translate([bodyLength / 2, 0, 0], h);
  });

  var body = [cylinder({ h: bodyLength, d: bodyDia, center: true })].map(function (b) {
    return rotate([0, 90, 0], b);
  });

  var tail = [hull(square({ size: [tailWidth, 2] }), translate([0, -tailWidth], circle({ r: 5 })), translate([-2, -tailLength], circle({ r: 0.4 })))].map(function (t) {
    return linear_extrude({ height: tailThickness }, t);
  }).map(function (t) {
    return translate([-bodyLength / 2, -bodyDia / 2, -tailThickness / 2], t);
  });

  //holes
  var cutoff = cube({ size: [l, headWidth, 20], center: true }).translate([headLength / 2, headWidth / 2, 0]); //bottom cut

  var mountHole = [cylinder({ h: axisDiaOD, d: axisDiaID })] //center cut
  .map(function (e) {
    return rotate([90, 0, 0], e);
  });

  var result = union(flatten([body, head, center, tail]));

  return rotate([-90, 0, 0], difference(flatten([result, cutoff, mountHole])));
}

function RainBucket(options) {
  var DEFAULTS = {
    h: 20,
    d: 30,
    walls: 3,
    outD: 2 //outflow hole dia

    , fn: 50,
    mountHoleD: 3 //diameter of mount holes
  };
  options = Object.assign({}, DEFAULTS, options);

  var _options2 = options;
  var d = _options2.d;
  var h = _options2.h;
  var walls = _options2.walls;
  var outD = _options2.outD;
  var mountHoleD = _options2.mountHoleD;
  var fn = _options2.fn;
  //h = 50, r1 = 20, r2 = 5, center = true

  var id = d - walls;
  var minId = outD;
  var bottomOffset = 10;

  var mountHoles = [];
  //cylinder({h,d:outD})

  return difference(cylinder({ h: h, d: d }), cylinder({ h: h, d2: id, d1: minId, fn: fn, center: true }), cylinder({ h: h, d: outD }));
}

function main() {
  var res = 50;

  var arrow = Arrow();
  var rainBucket = RainBucket();

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
  return arrow;
}

console.log("Done");
