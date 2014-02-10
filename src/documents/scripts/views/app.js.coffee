$ = window.$
{View, Route} = require('./base')

{wait} = require('../util')

# View
class App extends View
  elements:
    '.container': '$container'

  constructor: ->
    super

# Export
module.exports = {App}
