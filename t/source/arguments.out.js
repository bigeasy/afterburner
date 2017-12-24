var cadence = require('cadence')
module.exports = require('hotspot')(function () {
    var one = self.vargs[0]
    var two = self.vargs[1]
    return [ one ]
})
