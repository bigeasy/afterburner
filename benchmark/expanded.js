var Benchmark = require('benchmark')

function echo (value, callback) { callback(null, value) }

var cadence = require('cadence')

var before = cadence(function (async, one) {
    async(function () {
        echo(one, async())
    }, function (two) {
        return [ two ]
    })
})

var after = (function () {
    function Afterburner (one) {
        this.vargs = [ one ]
        this.vars = [{}]
        this.vars[0].one = this.vargs[0]
    }

    Afterburner.prototype.main = require('hotspot')(function (async) {
        this.f1(async())
    })

    Afterburner.prototype.f1 = require('hotspot')(function (async) {
        echo(this.vars[0].one, async())
    }, function (async, two) {
        return [ two ]
    })

    return function (one, callback) {
        return (new Afterburner(one)).main(callback)
    }
})()

var suite = new Benchmark.Suite('async', { /*minSamples: 100*/ })

for (var i = 1; i <= 4; i++)  {
    suite.add({
        name: 'cadence async ' + i,
        fn: function () {
            before(1, function () {})
        }
    })

    suite.add({
        name: 'hotspot async ' + i,
        fn: function () {
            after(1, function () {})
        }
    })
}

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
