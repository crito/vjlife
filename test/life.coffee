expect = require('expect.js')
life   = require('../out/scripts/lib/life')

describe 'Utility functions', ->
  describe 'internal API', ->
    for func in ['buildGrid', 'duplicateGrid', 'countNeighbours', 'isLiveCell']
      do (func) ->
        it "#{func} is defined" , ->
          expect(life[func]).to.not.be(undefined)
          expect(life[func]).to.be.a('function')
        
  describe 'buildGrid', ->
    it 'builds a matrix of X times Y elements', ->
      for X in [1..8]
        for Y in [1..8]
          grid = life.buildGrid(X, Y)
          expect(grid.length).to.be(X)
          for row in grid
            expect(row.length).to.be(Y)

            for cell in row
              expect(cell).to.be(false)

  describe 'duplicateGrid', ->
    coinFlip = -> Math.floor(Math.random() * 2) is 1
    grid = ((coinFlip() for cell in [0...7]) for row in [0...7])
    duplicatedGrid = life.duplicateGrid(grid)
    
    # makes an identical copy of a grid
    expect(duplicatedGrid).to.not.be(grid)

    # the duplicate grid has the same amount of rows
    expect(duplicatedGrid.length).to.be(grid.length)
      
    # each row has the same amount of cells
    for row, i in duplicatedGrid
      expect(row.length).to.be(grid[i].length)

      # Each cell should contain identical values
      for cell, j in row
        expect(cell).to.be(grid[i][j])

  describe 'countNeighbours', ->
    it 'counts the live neighbours of a cell', ->
      grid = ((false for cell in [0...5]) for row in [0...5])
      
      # The position of the cell to check, the center of the grid
      x = y = 2

      expect(life.countNeighbours(grid, x, y)).to.be(0)

      # Lets set the north-west neighbour cell of the cell to check to true
      grid[x+(-1)][y+(-1)] = true
      expect(life.countNeighbours(grid, x, y)).to.be(1)

      # Lets set the south neighbour cell of the cell to check to true
      grid[x+1][x+0] = true
      expect(life.countNeighbours(grid, x, y)).to.be(2)

      # Only direct neighbouring cells are counted, set a non neighbour cell of
      # the cell to check
      grid[0][0] = true
      expect(life.countNeighbours(grid, x, y)).to.be(2)

  describe 'isLiveCell', ->
    it 'kills the active cell if under-populated', ->
      for count in [0..1]
        expect(life.isLiveCell(true, count)).to.be(false)

    it 'extends the life of the active cell when having 2 or 3 neighbours', ->
      for count in [2..3]
        expect(life.isLiveCell(true, count)).to.be(true)

    it 'kills the active cell if over-crowded', ->
      for count in [4..10]
        expect(life.isLiveCell(true, count)).to.be(false)

    it 'reanimates any dead cell with exactly 3 neighbours', ->
      expect(life.isLiveCell(false, 3)).to.be(true)

    it 'dead cells with any neighbour count other than 3 stay dead', ->
      for count in [0..5] when count isnt 3
        expect(life.isLiveCell(false, count)).to.be(false)

describe 'API', ->
  for func in ['initialGrid', 'newGeneration']
    do (func) ->
      it "defines the function: #{func}", ->
        expect(life[func]).to.not.be(undefined)
        expect(life[func]).to.be.a('function')
  
  describe 'initialGrid', ->
    it 'returns a grid with a configured pattern', ->
      pattern = [{x: 1, y: 1}, {x: 3, y: 3}]
      grid = life.initialGrid(pattern, 8, 4)

      # Check the size of the initial grid
      expect(grid.length).to.be(8)
      for row in grid
        expect(row.length).to.be(4)

      # Check that the grid matches the pattern
      for row, i in grid
        for cell, j in row
          # The pattern sets 1/1 and 3/3 to true
          if (i is 1 and j is 1) or (i is 3 and j is 3)
            expect(cell).to.be(true)
          else
            expect(cell).to.be(false)

  describe 'newGeneration', ->
    it 'creates a new generation of a grid', ->
      # This is a simple blinker pattern
      pattern = [
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 2, y: 3}]
      grid = life.initialGrid(pattern, 5, 5)

      # Test the initial grid
      for row, i in grid
        for cell, j in row
          if i is 2 and (j is 1 or j is 2 or j is 3)
            expect(cell).to.be(true)
          else expect(cell).to.be(false)

      # Create a new generation and test the new pattern
      grid = life.newGeneration(grid)
      for row, i in grid
        for cell, j in row
          if j is 2 and (i is 1 or i is 2 or i is 3)
            expect(cell).to.be(true)
          else expect(cell).to.be(false)
