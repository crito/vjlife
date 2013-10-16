'use strict';

var ON  = true;
var OFF = false;

var buildGrid = function (sizeX, sizeY) {
  return _.map(_.range(sizeX), function (x) {
    return _.map(_.range(sizeY), function (y) {
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

var logGrid = function (grid, offSymbol) {
  console.log(_.reduce(grid, function (log, row) {
    return log + '\n' + _.reduce(row, function (memo, cell) {
        return memo += cell ? "X" : offSymbol;
      }, "");
  }, ""));
  // _.reduce(grid, function (log, row) {
  //   return log + '\n' + _.reduce(row, function (memo, cell) {
  //       return memo += cell ? "X" : " ";
  //     }, "");
  // }, "");
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
  {x: 1 ,y: 2},
  {x: 2, y: 1},
  {x: 2, y: 2},
  {x: 2, y: 3},
  {x: 3, y: 3},
    ]
}

// var DATA = tumbler;
var DATA = blinker;
// var DATA = rPentomino;

var initialGrid = function (sizeX, sizeY) {
  var state = DATA.turn,
      size = arguments[0] ? arguments[0] : 8;
  return _.reduce(DATA.cells, function (memo, pos) {
    memo[pos.x][pos.y] = state;
    return memo;
  }, buildGrid(sizeX, sizeY));
};

var newGeneration = function (grid) {
  return mapGrid(grid, function (memo, cell, rowNr, cellNr, grid) {
      var newState = isLiveCell(cell, countNeighbours(grid, rowNr, cellNr));
      if (_.ext.existy(newState)) {
        memo[rowNr][cellNr] = newState;
      }
      return memo;
  }, buildGrid(grid.length, grid[0].length));
};

var gameSeries = function (initial, times) {
  // logGrid(initial);
  return _.reduce(_.range(times), function (memo, index) {
    var c = newGeneration(memo[index]);
    logGrid(c);
    memo.push(c); return memo;
  }, [initial]);
};

var App = function (sizeX, sizeY) {
  this.interval = 300;
  this.generations = [initialGrid(sizeX, sizeY)];
  this.current = 0;
  this.contrast = false;
}

App.prototype.play = function () {
  var that = this;

  if (this.intervalID) { this.stop(); }
  this.intervalID = setInterval(function () {
    var c;
    if (that.current < 0) {
      console.log(that.current, that.generations.length);
      c = that.generations[that.current];
      that.current += 1;
    } else {
      c = newGeneration(_.last(that.generations));
      that.generations.push(c);
    }
    logGrid(c, that.contrast ? 'o' : ' ');
  }, this.interval);
};

App.prototype.stop = function () {
  clearInterval(this.intervalID);
  this.intervalID = undefined;
};

App.prototype.setInterval = function (newInterval) {
  this.interval = newInterval;
  this.play();
};

App.prototype.stepBack = function () {
  if (this.intervalID) { this.stop(); }
  // FIXME: check that current doesn't get bigger than generations.length
  this.current -= 1;

  return this.current;
}

App.prototype.stepForward = function () {
  if (this.intervalID) { this.stop(); }
  if (this.current < 0) { this.current += 1; }

  return this.current;
}

App.prototype.toggleContrast = function () {
  this.contrast = !this.contrast;
}
