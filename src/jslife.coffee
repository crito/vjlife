_ = require('lodash')

ON  = true
OFF = false

###
# Utility/Helper functions
###

# Build a matrix that represents the game grid. As a default all cells are set
# to false.
buildGrid = (sizeX, sizeY) ->
  (for row in [0...sizeX]
    OFF for cell in [0...sizeY])

# Reduce an iterator function on a grid. The iterator gets called with the
# following arguments:
# - memo: the aggregated value
# - cell: the current cell of the grid
# - rowNr: the row index of the current grid
# - cellNr: the cell index of the current grid
# - grid: the grid that gets iterated
reduceGrid = (grid, iterator, initial) ->
  _.reduce grid, (context, row, rowNr) ->
    _.reduce row, (memo, cell, cellNr) ->
      iterator.call(null, memo, cell, rowNr, cellNr, grid)
    , context
  , initial

# Create a copy of a grid
duplicateGrid = (grid) ->
  reduceGrid grid, (memo, cell, rowNr, cellNr, grid) ->
    if cell is ON then memo[rowNr][cellNr] = ON
    memo
  , buildGrid(grid.length, grid[0].length)

# Count the amount of live cells around a cell.
#
# +------+------+-----+
# |-1/-1 | -1/0 |-1/1 |
# +------+------+-----+
# | 0/-1 | CELL | 0/1 |
# +------+------+-----+
# | 1/-1 | 1/0  | 1/1 |
# +------+------+-----+
countNeighbours = (grid, x, y) ->
  xSeries = [-1, 0, 1, 1,  1,  0, -1, -1]
  ySeries = [ 1, 1, 1, 0, -1, -1, -1,  0]
  size = grid.length

  _.reduce [0...8], (count, index) ->
    neighbourX = x + xSeries[index]
    neighbourY = y + ySeries[index]

    if neighbourX > 0 and neighbourY > 0 and
       neighbourX < size and neighbourY < size and
       grid[neighbourX][neighbourY] then count + 1 else count
  , 0

# Those are the rules that determine the new state of a cell. The rules are
# taken from: http://en.wikipedia.org/wiki/Conway's_Game_of_Life#Rules 
isLiveCell = (cell, count) ->
  if cell and count < 2       then return false
  if cell and count in [2, 3] then return true
  if cell and count > 3       then return false
  if not cell and count is 3  then return true
  return false

###
# Test data
###

tumbler =
  cells: [
    {x: 1, y: 0},
    {x: 7, y: 0},
    {x: 0, y: 1},
    {x: 2, y: 1},
    {x: 6, y: 1},
    {x: 8, y: 1},
    {x: 2, y: 2},
    {x: 6, y: 2},
    {x: 2, y: 2},
    {x: 3, y: 2},
    {x: 4, y: 3},
    {x: 6, y: 4}]

blinker =
  cells: [
    {x: 2, y: 1},
    {x: 2, y: 2},
    {x: 2, y: 3}]

rPentomino =
  cells: [
    {x: 1 ,y: 2},
    {x: 2, y: 1},
    {x: 2, y: 2},
    {x: 2, y: 3},
    {x: 3, y: 3}]


# Log the grid to the console
logGrid = (grid, offSymbol='.') ->
  console.log(_.reduce grid, (log, row) ->
    log + '\n' + _.reduce row, (memo, cell) ->
      if cell then memo += 'X' else memo += offSymbol
      memo
    , ''
  , '')

# Create an initial grid
initialGrid = (pattern, sizeX=8, sizeY=8) ->
  _.reduce pattern, (memo, pos) ->
    memo[pos.x][pos.y] = ON
    memo
  , buildGrid(sizeX, sizeY)

# Return a new generation of a grid
newGeneration = (grid) ->
  reduceGrid grid, (memo, cell, rowNr, cellNr, grid) ->
    memo[rowNr][cellNr] = isLiveCell(cell,
                                     countNeighbours(grid, rowNr, cellNr))
    memo
  , buildGrid(grid.length, grid[0].length)

# Create a series of generations
gameSeries = (initial, times, logFunc=logGrid) ->
  _.reduce [0..times], (memo) ->
    logFunc(memo = newGeneration(memo))
    memo
  , initial


###
# The game class manages the life time of the patterns
###
class Game
  constructor: (sizeX=5, sizeY=5, pattern=blinker.cells) ->
    @interval    = 300
    @generations = [initialGrid(pattern, sizeX, sizeY)]
    @current     = 0
    @contrast    = false

  play: ->
    # Stop the game prior to starting it
    if @intervalID then @stop()

    @intervalID = setInterval =>
      if @current < 0
        c = @generations[@current]
        @current += 1
      else
        c = newGeneration(_.last(@generations))
        @generations.push(c)
      logGrid(c)
    , @interval

  stop: ->
    clearInterval(@intervalID)
    @intervalID = null

  setInterval: (@newInterval) ->
    @play()

  toggleContrast: ->
    @contrast = !@contrast
    

module.exports =
  Game          : Game
  logGrid       : logGrid
  initialGrid   : initialGrid
  newGeneration : newGeneration
  gameSeries    : gameSeries
  data          :
    tumbler   : tumbler
    blinker   : blinker
    rPentomino: rPentomino
    
if process.env.NODE_ENV == "test"
  module.exports = _.extend module.exports, 
    buildGrid       : buildGrid
    duplicateGrid   : duplicateGrid
    countNeighbours : countNeighbours
    isLiveCell      : isLiveCell
