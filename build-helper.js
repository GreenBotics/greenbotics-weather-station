var watch = require('node-watch')
var exec  = require('child_process').exec
var path  = require('path')


var filter = function(pattern, fn) {
  return function(filename) {
    if (pattern.test(filename)) {
      fn(filename);
    }
  }
}

watch('cad/src', filter(/\.js$/, function(filename) {
  var bname = path.basename(filename)
  console.log(filename, ' changed.');
  //var cmd = "sed -i '' 's/" +'"use strict";'+"//g' "+ filename
  var cmd = "sed 's/" +'"use strict";'+"//g' "+ filename +" > cad/out/"+bname
  console.log("commmand",cmd)
  exec(cmd, function(error, stdout, stderr) {
    if(error){
      console.log("error",error)
      //sink.error(error)
    }
    else{
      console.log("ok ",stdout)
      //sink.add(stdout)
      //sink.end()
    }
  }) 


}));