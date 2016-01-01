

export function applyDefaults(options, DEFAULTS){
  return Object.assign({}, DEFAULTS, options)
}

export function addComputedParams(options){
  let bodyLength = options.l - options.headLength
  let computed = {bodyLength}
  options = Object.assign({}, options, computed)
  return options
}