var levelup = require('levelup')

var db = levelup('./karma-db')

module.exports = karma

function karma(ziggy) {
  ziggy.on('message', parse_command)

  function parse_command(user, channel, text) {
    var bits = text.split(' ')
      , karma_user = bits.length > 1 ? bits.slice(1).join(' ').trim() : null
      , command = bits[0]

    if (command[0] !== '!') return

    ({
        '!m': add_point
      , '!motivate': add_point
      , '!merit': add_point
      , '!thanks': add_point
      , '!ty': add_point
      , '!dm': sub_point
      , '!demotivate': sub_point
      , '!demerit': sub_point
      , '!boo': sub_point
      , '!k': check_points
      , '!karma': check_points
      , 'flog': sub_ten_points
    }[command] || noop)()

    function add_point() {
      if (!karma_user) karma_user = channel
      ziggy.say(channel, 'You\'re doing great work, ' + karma_user + '!')
      db.get(karma_user, add_karma)
    }

    function sub_point() {
      if (!karma_user) karma_user = channel
      ziggy.say(channel, 'You\'re doing terrible work, ' + karma_user + '!')
      db.get(karma_user, sub_karma)

      function sub_karma(err, previous) {
        if (err) {
          if (err.type !== 'NotFoundError') return
          previous = 0
        }

        db.put(karma_user, --previous, noop)
      }
    }

    function sub_ten_points() {
      if (!karma_user) karma_user = channel
      ziggy.say(channel, 'You\'re doing terrible work, ' + karma_user + '! You must be flogged.')
      db.get(karma_user, sub_ten_karma)

      function sub_ten_karma(err, previous) {
        if (err) {
          if (err.type !== 'NotFoundError') return
          previous = 0
        }

        db.put(karma_user, previous -= 10, noop)
      }
    }

    function thank_user(){
      if (!karma_user) karma_user = channel
      ziggy.say(channel, 'Thank you, ' + karma_user + ', you are a fine human being!');
      db.get(karma_user, add_karma);
    }

    function check_points() {
      if (!karma_user) karma_user = user.nick
      db.get(karma_user, show_karma)

      function show_karma(err, previous) {
        if (err) {
          if (err.type !== 'NotFoundError') return
          previous = 0
        }

        var point_word = previous === '1' ? 'point' : 'points'

        ziggy.say(
            channel
          , karma_user + ' has ' + previous + ' karma ' + point_word + '!'
        )
      }
    }

    function add_karma(err, previous) {
      if (err) {
        if (err.type !== 'NotFoundError') return
        previous = 0
      }

      db.put(karma_user, ++previous, noop)
    }
  }
}

function noop() {}
