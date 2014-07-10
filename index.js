var levelup = require('levelup')

var ziggy_db = levelup('./karma-db')

karma.help = [
    '!m, !thanks, !ty, !durant <name> - add karma to <name>'
  , '!dm, !boo <name> - remove karma from <name>'
  , '!hf <name> - add *lots* of karma to <name>'
  , '!flog <name> - remove *lots* of karma from <name>'
  , '!k <name> - check <name>\'s karma score'
].join('\n')

module.exports = karma

function karma(ziggy, _db, _onchange) {
  var onchange = _onchange || noop
    , db = _db || ziggy_db

  ziggy.on('message', parse_command)

  function parse_command(user, channel, text) {
    var bits = text.split(' ')
      , karma_user = bits.length > 1 ? bits.slice(1).join(' ').trim() : null
      , command = bits[0]

    if (command[0] !== '!') return

    ({
        '!m': motivate
      , '!motivate': motivate
      , '!merit': motivate
      , '!thanks': thank_user
      , '!ty': thank_user
      , '!highfive': high_five
      , '!hf': high_five
      , '!dm': demotivate
      , '!demotivate': demotivate
      , '!demerit': demotivate
      , '!boo': demotivate
      , '!k': check_points
      , '!karma': check_points
      , '!flog': flog
      , '!durant' : durant
    }[command] || noop)()

    function motivate() {
      if (!karma_user) karma_user = channel
      ziggy.say(channel, 'You\'re doing great work, ' + karma_user + '!')

      set_karma(karma_user, 1)
    }

    function durant() {
      if (!karma_user) karma_user = channel

      if(karma_user === channel){
        ziggy.say(channel, 'Thanks ' + karma_user + '. You guys and gals are da real mvps.')
      } else {
        ziggy.say(channel, 'Thanks ' + karma_user + '. You da real mvp.')
      }

      set_karma(karma_user, 1)
    }

    function demotivate() {
      if (!karma_user) karma_user = channel
      ziggy.say(channel, 'You\'re doing terrible work, ' + karma_user + '!')

      set_karma(karma_user, -1)
    }

    function flog() {
      if (!karma_user) karma_user = channel
      ziggy.say(
          channel
        , 'You\'re doing terrible work, ' + karma_user +
          '! You must be flogged.'
      )

      set_karma(karma_user, -10)
    }

    function high_five() {
      if (!karma_user) karma_user = channel
      ziggy.say(channel, 'High five, ' + karma_user + '! Great work!')

      set_karma(karma_user, 10)
    }

    function thank_user() {
      if (!karma_user) karma_user = channel
      ziggy.say(
          channel
        , 'Thank you, ' + karma_user + ', you are a fine human being!'
      )

      set_karma(karma_user, 1)
    }

    function check_points() {
      if (!karma_user) karma_user = user.nick
      db.get(karma_user.toLowerCase(), show_karma)

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
  }

  function set_karma(_entity, diff) {
    var entity = _entity.toLowerCase()
    db.get(entity, modify_karma)

    function modify_karma(err, current) {
      if (err) {
        if (err.type !== 'NotFoundError') return
        current = 0
      }

      db.put(entity, +current + diff, onchange)
    }
  }
}

function noop() {}
