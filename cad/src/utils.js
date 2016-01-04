import {of, head, flatten} from 'ramda'

export function applyDefaults(options, DEFAULTS){
  return Object.assign({}, DEFAULTS, options)
}

export function addComputedParams(options){
  let bodyLength = options.l - options.headLength
  let computed = {bodyLength}
  options = Object.assign({}, options, computed)
  return options
}

export function validateParams(options){
  return options
}

export function makeParams (options, DEFAULTS, _addComputedParams, _validateParams) {
  let __validateParams    = _validateParams || validateParams
  let __addComputedParams = _addComputedParams || addComputedParams

  options =  of(options || {})//options
    .map( o => applyDefaults(o, DEFAULTS) )
    .map( function(options){//inject addComputedParams
      return Object.assign( {}, options, __addComputedParams(options) )
    })
    .map( __validateParams )

  return head(options)
}