'use strict';

var ON  = true;
var OFF = false;

var buildGrid = function (size) {
  return _.map(_.range(size), function (x) {
    return _.map(_.range(size), function (y) {
      return OFF;
    });
  });
};

var mapGrid = function (grid, iterator, initial) {
  return _.reduce(grid, function (context, row, rowNr) {
    return _.reduce(row, function (memo, cell, cellNr) {
      return iterator.call(null, memo, cell, rowNr, cellNr, grid);
    }, context);
  }, initial)
};

var duplicateGrid = function (grid) {
  return mapGrid(grid, function (memo, cell, rowNr, cellNr, grid) {
      if (cell === true) {
        memo[rowNr][cellNr] = true;
      }
      return memo;
    }, buildGrid(grid.length));
};

var countNeighbours = function (grid, x, y) {
  var xSeries = [-1, 0, 1, 1, 1, 0, -1, -1],
      ySeries = [1, 1, 1, 0, -1, -1, -1, 0],
      size = grid.length;

  return _.reduce(_.range(8), function (count, index) {
    var neighbourX = x + xSeries[index],
        neighbourY = y + ySeries[index];
    return neighbourX > 0 && neighbourY > 0 &&
           neighbourX < size && neighbourY < size &&
           grid[neighbourX][neighbourY] ? count + 1 : count;
  }, 0)
};

var isLiveCell = function (cell, count) {
  return (_.ext.dispatch(
      function (s, c) { return s && c < 2 ? false : undefined; },
      function (s, c) { return s && (c === 2 || c === 3) ? true : undefined; },
      function (s, c) { return s && c > 3 ? false : undefined; },
      function (s, c) { return !s && c === 3 ? true : undefined; }
  ))(cell, count);
}

var logGrid = function (grid) {
  console.log(_.reduce(grid, function (log, row) {
    return log + '\n' + _.reduce(row, function (memo, cell) {
        return memo += cell ? "X" : " ";
      }, "");
  }, ""));
  // console.log(mapGrid(grid, function (memo, cell) {
  //     return memo += cell ? 'X' : ' ';
  //   }, ""));
};


var tumbler = {
  turn: ON,
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
  {x: 6, y: 4},
    ]
}

var blinker = {
  turn: ON,
  cells: [
  {x: 2, y: 1},
  {x: 2, y: 2},
  {x: 2, y: 3},
    ]
}

var rPentomino = {
  turn: ON,
  cells: [
  {x: 2 ,y: 3},
  {x: 3, y: 2},
  {x: 3, y: 3},
  {x: 3, y: 4},
  {x: 4, y: 4},
    ]
}

// var DATA = tumbler;
var DATA = blinker;
// var DATA = rPentomino;

var initialGrid = function (/* size */) {
  var state = DATA.turn,
      size = arguments[0] ? arguments[0] : 8;
  return _.reduce(DATA.cells, function (memo, pos) {
    memo[pos.x][pos.y] = state;
    return memo;
  }, buildGrid(size));
};

var newGeneration = function (grid) {
  return mapGrid(grid, function (memo, cell, rowNr, cellNr, grid) {
      var newState = isLiveCell(cell, countNeighbours(grid, rowNr, cellNr));
      if (_.ext.existy(newState)) {
        memo[rowNr][cellNr] = newState;
      }
      return memo;
  }, duplicateGrid(grid));
};

var series = function (initial, times) {
  // logGrid(initial);
  return _.reduce(_.range(times), function (memo, index) {
    var c = newGeneration(memo[index]);
    logGrid(c);
    memo.push(c); return memo;
  }, [initial]);
}
