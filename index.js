var levelup = require('levelup')

var db = levelup('./karma-db')

module.exports = karma

function karma(ziggy) {
  ziggy.on('message', parse_command)

  function parse_command(user, channel, text) {
    var bits = text.split(' ')
      , karma_user = bits.length > 1 ? bits.slice(1).join(' ') : null
      , command = bits[0]

    if (command[0] !== '!') return

    ({
        '!m': add_point
      , '!merit': add_point
      , '!thanks': add_point
      , '!dm': sub_point
      , '!demerit': sub_point
      , '!k': check_points
      , '!karma': check_points
    }[command] || noop)()

    function add_point() {
      if (!karma_user) karma_user = channel
      ziggy.say(channel, 'You\'re doing great work, ' + karma_user + '!')
      db.get(karma_user, add_karma)

      function add_karma(err, previous) {
        if (err && err.type === 'NotFoundError') previous = 0
        db.put(karma_user, ++previous, noop)
      }
    }

    function sub_point() {
      if (!karma_user) karma_user = channel
      ziggy.say(channel, 'You\'re doing terrible work, ' + karma_user + '!')
      db.get(karma_user, sub_karma)

      function sub_karma(err, previous) {
        if (err && err.type === 'NotFoundError') previous = 0
        db.put(karma_user, --previous, noop)
      }
    }

    function check_points() {
      if (!karma_user) karma_user = user.nick
      db.get(karma_user, show_karma)

      function show_karma(err, previous) {
        if (err && err.type === 'NotFoundError') previous = 0

        var point_word = previous === '1' ? 'point' : 'points'

        ziggy.say(
            channel
          , karma_user + ' has ' + previous + ' karma ' + point_word + '!'
        )
      }
    }
  }
}

function noop() {}
