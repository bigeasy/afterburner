require('proof')(2, prove)

function strip (object) {
    if (object == null) {
        return null
    }
    if (Array.isArray(object)) {
        return object.map(strip)
    }
    if (typeof object == 'object') {
        if ('start' in object) {
            delete object.start
        }
        if ('end' in object) {
            delete object.end
        }
        if ('raw' in object) {
            delete object.raw
        }
        var plain = {}
        for (var key in object) {
            plain[key] = strip(object[key])
        }
        return plain
    }
    return object
}

function prove (okay) {
    var acorn = require('acorn')
    var walk = require('acorn/dist/walk')
    var escodegen = require('escodegen')
    var fs = require('fs')
    var path = require('path')
    var parser = require('../parser')
    var source = fs.readFileSync(path.join(__dirname, 'parse/minimal.in.js'), 'utf8')
    var actual = strip(parser.walk(source))
    var expected = strip(acorn.parse(fs.readFileSync(path.join(__dirname, 'parse/minimal.out.js'), 'utf8')))
    okay.say(escodegen.generate(actual))
    okay.say(escodegen.generate(expected))
    okay(actual, expected, 'minimal')
    require('./parse/minimal.out')(function (error, value) {
        okay(value, 1, 'compiled')
    })
}
