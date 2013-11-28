# https://github.com/crito/js.scaffold

# =====================================
# Imports

fsUtil = require('fs')
pathUtil = require('path')

# =====================================
# Variables

WINDOWS       = process.platform.indexOf('win') is 0
NODE          = process.execPath
NPM           = (if WINDOWS then process.execPath.replace('node.exe', 'npm.cmd') else 'npm')
EXT           = (if WINDOWS then '.cmd' else '')
APP_DIR       = process.cwd()
PACKAGE_PATH  = pathUtil.join(APP_DIR, "package.json")
PACKAGE_DATA  = require(PACKAGE_PATH)
DOCS_DIR      = pathUtil.join(APP_DIR, "docs")
DOCS_INPUT    = pathUtil.join(APP_DIR, "src", "*")
SRC_DIR       = pathUtil.join(APP_DIR, "src")
OUT_DIR       = pathUtil.join(APP_DIR, "dist")
TEST_DIR      = pathUtil.join(APP_DIR, "test")
MODULES_DIR   = pathUtil.join(APP_DIR, "node_modules")
BIN_DIR       = pathUtil.join(MODULES_DIR, ".bin")
GIT           = "git"
CAKE          = pathUtil.join(BIN_DIR, "cake#{EXT}")
COFFEE        = pathUtil.join(BIN_DIR, "coffee#{EXT}")
PROJECTZ      = pathUtil.join(BIN_DIR, "projectz#{EXT}")
DOCCO         = pathUtil.join(BIN_DIR, "docco#{EXT}")

# =====================================
# Generic

{exec,spawn} = require('child_process')
safe = (next,fn) ->
  fn ?= next  # support only one argument
  return (err) ->
    # success status code
    if err is 0
      err = null

    # error status code
    else if err is 1
      err = new Error('Process exited with error status code')

    # Error
    return next(err)  if err

    # Continue
    return fn()

finish = (err) ->
  throw err  if err
  console.log('OK')

# =====================================
# Actions

actions =
  clean: (opts,next) ->
    (next = opts; opts = {})  unless next?
    args = ['-Rf', OUT_DIR]
    for path in [APP_DIR, TEST_DIR]
      args.push(
        pathUtil.join(path,  'build')
        pathUtil.join(path,  'components')
        pathUtil.join(path,  'bower_components')
        pathUtil.join(path,  'node_modules')
        pathUtil.join(path,  '*out')
        pathUtil.join(path,  '*log')
      )
    # rm
    spawn('rm', args, {stdio:'inherit', cwd:APP_DIR}).on('close', safe next)

  install: (opts,next) ->
    (next = opts; opts = {})  unless next?
    step1 = ->
      # npm install (for app)
      spawn(NPM, ['install'], {stdio:'inherit', cwd:APP_DIR}).on('close', safe next, step2)
    step2 = ->
      fsUtil.exists TEST_DIR, (exists) ->
        return next()  unless exists
        # npm install (for test)
        spawn(NPM, ['install'], {stdio:'inherit', cwd:TEST_DIR}).on('close', safe next)
    step1()

  compile: (opts,next) ->
    (next = opts; opts = {})  unless next?
    # cake install
    actions.install opts, safe next, ->
      # coffee compile
      spawn(COFFEE, ['-co', OUT_DIR, SRC_DIR], {stdio:'inherit', cwd:APP_DIR}).on('close', safe next)

  watch: (opts,next) ->
    (next = opts; opts = {})  unless next?
    # cake install
    actions.install opts, safe next, ->
      # coffee watch
      spawn(COFFEE, ['-wco', OUT_DIR, SRC_DIR], {stdio:'inherit', cwd:APP_DIR}).on('close', safe next)

  test: (opts,next) ->
    (next = opts; opts = {})  unless next?
    # cake compile
    actions.compile opts, safe next, ->
      # npm test
      spawn(NPM, ['test'], {stdio:'inherit', cwd:APP_DIR}).on('close', safe next)

  docs: (opts, next) ->
    (next = opts; opts = {})  unless next?
    # docco compile
    fsUtil.exists DOCCO, (exists) ->
      exec("#{DOCCO} -o #{DOCS_DIR} #{DOCS_INPUT}", {stdio:'inherit', cwd:APP_DIR}, safe next)

  projectz: (opts, next) ->
    # project compile
    fsUtil.exists PROJECTZ, (exists) ->
      spawn(PROJECTZ, ['compile'], {stdio:'inherit', cwd:APP_DIR}).on('close', safe next)

  prepublish: (opts,next) ->
    (next = opts; opts = {})  unless next?
    actions.docs opts, save next ->
      step1 = ->
        # cake compile
        actions.compile(opts, safe next, step2)
      step2 = ->
        # project compile
        actions.projectz(opts, safe next, step3)
      step3 = ->
        # docco compile
        actions.docs(opts, safe next, step4)
      step4 = ->
        # npm test
        actions.test(opts, safe next)
      step1()

  publish: (opts,next) ->
    (next = opts; opts = {})  unless next?
    # cake prepublish
    actions.prepublish opts, safe next, ->
      # npm publish
      spawn(NPM, ['publish'], {stdio:'inherit', cwd:APP_DIR}).on 'close', safe next, ->
        # git tag
        spawn(GIT, ['tag', 'v'+PACKAGE_DATA.version, '-a'], {stdio:'inherit', cwd:APP_DIR}).on 'close', safe next, ->
          # git push origin master
          spawn(GIT, ['push', 'origin', 'master'], {stdio:'inherit', cwd:APP_DIR}).on 'close', safe next, ->
            # git push tags
            spawn(GIT, ['push', 'origin', '--tags'], {stdio:'inherit', cwd:APP_DIR}).on('close', safe next)

# =====================================
# Commands

commands =
  clean:       'clean up instance'
  install:     'install dependencies'
  compile:     'compile our files (runs install)'
  watch:       'compile our files initially, and again for each change (runs install)'
  test:        'run our tests (runs compile)'
  docs:        'create docs using docco'
  projectz:    'generate the readme using projectz'
  prepublish:  'prepare our package for publishing'
  publish:     'publish our package (runs prepublish)'

Object.keys(commands).forEach (key) ->
  description = commands[key]
  fn = actions[key]
  task key, description, (opts) ->  fn(opts, finish)
