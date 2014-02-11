$ = window.$
{View, Route} = require('./base')
{Grid} = require('./grid')

{wait} = require('../util')

# View
class App extends View
  elements:
    '.game-board': '$gameBoard'

  constructor: ->
    super

    @grid = new Grid
    @grid.$el.appendTo(@$gameBoard)

    @
    
# Export
module.exports = {App}
