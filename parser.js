var acorn = require('acorn')
var _walk = require('acorn/dist/walk')
var escodegen = require('escodegen')
var assert = require('assert')

function dump (node) {
    console.log(require('util').inspect(node, { depth: Infinity }))
}

function findDeclarations (node, declarations) {
    if (
        node.type == 'CallExpression' &&
        node.callee.name == 'cadence'
    ) {
        declarations.push(declarations)
    } else {
        return findDeclarations(node, declarations)
    }
}

function explode (node) {
    var f = node.arguments[0]
    assert(f.type == 'FunctionExpression')
    var params = f.params.slice(1)
    if (params.length != 0) {
        for (var i = params.length - 1; i >= 0; i--) {
        // TODO Copy parameters to local variables.
        f.body.body.unshift({
            type: 'VariableDeclaration',
            declarations: [{
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: params[i].name },
                init: {
                    type: 'MemberExpression',
                    object: {
                        type: 'MemberExpression',
                        object: { type: 'Identifier', name: 'self' },
                        property: { type: 'Identifier', name: 'vargs' },
                        computed: false
                    },
                    property: { type: 'Literal', value: i },
                    computed: true
                }
            }],
            kind: 'var'
        })
        }
    }
    // TODO Need to map `arguments` to `this.vargs`.
    return {
        type: 'CallExpression',
        callee: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'require' },
            'arguments': [{
                type: 'Literal',
                value: 'hotspot'
            }]
        },
        'arguments': [{
            type: 'FunctionExpression',
            id: null,
            generator: false,
            expression: false,
            params: [],
            body: f.body
        }]
    }
}

function walk (source) {
    var node = acorn.parse(source)
    var declarations = []
    _walk.ancestor(node, {
        CallExpression: function (node, path) {
            if (node.callee.name == 'cadence') {
                declarations.push(path.slice().reverse()[1])
            }
        }
    })
    declarations.forEach(function (node) {
        switch (node.type) {
        case 'AssignmentExpression':
            node.right = explode(node.right)
            break
        }
    })
    return node
}

exports.walk = walk
