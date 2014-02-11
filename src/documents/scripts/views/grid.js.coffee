{View,Route} = require('./base')
life = require('../lib/life')

createBoard = (width, height) ->
  canvas = document.createElement('canvas')
  canvas.height = height
  canvas.width = width
  canvas

makeGridLogger = (canvas, blockSize) ->
  (grid) ->
    ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1
    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 1

    for row, i in grid
      for cell, j in row
        if cell
          ctx.fillRect(i*blockSize, j*blockSize, blockSize, blockSize)

class Grid extends View
  el: $('.grid').remove().first().prop('outerHTML')
  blockSize: 25
  grid: []
  
  constructor: ->
    super

    @canvas = createBoard($(document).width(), $(document).height())
    @$el.append(@canvas)

    x = Math.floor(@canvas.width/@blockSize) + 1
    y = Math.floor(@canvas.height/@blockSize) + 1

    game = new life.Game(x, y,
                         life.data.blinker.cells,
                         makeGridLogger(@canvas, @blockSize))
    game.play()
    
    @

# Export
module.exports = {Grid}
