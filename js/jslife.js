'use strict';

var ON  = true;
var OFF = false;

var buildGrid = function (size) {
  return _.map(_.range(size), function (x) {
    return _.map(_.range(size), function (y) {
      return OFF;
    });
  });
}
