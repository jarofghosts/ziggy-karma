var levelup = require('levelup')

var ziggyDb = levelup('./karma-db')

karma.help = [
    '!m, !thanks, !ty, !durant <name> - add karma to <name>'
  , '!dm, !boo <name> - remove karma from <name>'
  , '!hf <name> - add *lots* of karma to <name>'
  , '!flog <name> - remove *lots* of karma from <name>'
  , '!k <name> - check <name>\'s karma score'
].join('\n')

karma.teardown = ziggyDb.close.bind(ziggyDb)

module.exports = karma

function karma(ziggy, _db, _onchange) {
  var onchange = _onchange || noop
    , db = _db || ziggyDb

  ziggy.on('message', parseCommand)

  function parseCommand(user, channel, text) {
    var bits = text.split(' ')
      , karmaUser = bits.length > 1 ? bits.slice(1).join(' ').trim() : null
      , command = bits[0]

    if(command[0] !== '!') return

    ({
        '!m': motivate
      , '!motivate': motivate
      , '!merit': motivate
      , '!thanks': thankUser
      , '!ty': thankUser
      , '!highfive': highFive
      , '!hf': highFive
      , '!dm': demotivate
      , '!demotivate': demotivate
      , '!demerit': demotivate
      , '!boo': demotivate
      , '!k': checkPoints
      , '!karma': checkPoints
      , '!flog': flog
      , '!durant' : durant
    }[command] || noop)()

    function motivate() {
      if(!karmaUser) karmaUser = channel
      ziggy.say(channel, 'You\'re doing great work, ' + karmaUser + '!')

      setKarma(karmaUser, 1)
    }

    function durant() {
      var message

      if(!karmaUser) karmaUser = channel

      message = 'Thanks ' + karmaUser + '. You '
      message += (
          karmaUser === channel ?
            'guys and gals are da real mvps.' : 'da real mvp.'
      )

      ziggy.say(channel, message)

      setKarma(karmaUser, 1)
    }

    function demotivate() {
      if(!karmaUser) karmaUser = channel
      ziggy.say(channel, 'You\'re doing terrible work, ' + karmaUser + '!')

      setKarma(karmaUser, -1)
    }

    function flog() {
      if(!karmaUser) karmaUser = channel
      ziggy.say(
          channel
        , 'You\'re doing terrible work, ' + karmaUser +
          '! You must be flogged.'
      )

      setKarma(karmaUser, -10)
    }

    function highFive() {
      if(!karmaUser) karmaUser = channel
      ziggy.say(channel, 'High five, ' + karmaUser + '! Great work!')

      setKarma(karmaUser, 10)
    }

    function thankUser() {
      if(!karmaUser) karmaUser = channel
      ziggy.say(
          channel
        , 'Thank you, ' + karmaUser + ', you are a fine human being!'
      )

      setKarma(karmaUser, 1)
    }

    function checkPoints() {
      if(!karmaUser) karmaUser = user.nick

      db.get(karmaUser.toLowerCase(), showKarma)

      function showKarma(err, previous) {
        if(err) {
          if(err.type !== 'NotFoundError') return
          previous = 0
        }

        var pointWord = previous === '1' ? 'point' : 'points'

        ziggy.say(
            channel
          , karmaUser + ' has ' + previous + ' karma ' + pointWord + '!'
        )
      }
    }
  }

  function setKarma(_entity, diff) {
    var entity = _entity.toLowerCase()
    db.get(entity, modifyKarma)

    function modifyKarma(err, current) {
      if(err) {
        if(err.type !== 'NotFoundError') return

        current = 0
      }

      db.put(entity, +current + diff, onchange)
    }
  }
}

function noop() {}
