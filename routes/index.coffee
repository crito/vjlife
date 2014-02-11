template = require('./template')

module.exports = (app) ->
  app.post('/template', template.create)
  app.get('/template', template.show)
