var EE = require('events').EventEmitter
  , karma_plugin = require('../')
  , levelup = require('levelup')
  , memdown = require('memdown')
  , test = require('tape')

function run_test(command, channel, nick, ziggy_message, karma) {
  test(command + ' works', function(t) {
    var db = levelup('/lol', {db: memdown})
      , fake_ziggy = new EE()

    var start = (Math.random() * 10 | 0)

    db.put(nick || channel, start, do_test)

    function do_test() {
      karma_plugin(fake_ziggy, db, test_karma)

      t.plan(4)

      fake_ziggy.say = function(to, message) {
        t.equal(to, channel, 'channel is ' + channel)
        t.equal(message, ziggy_message, 'says "' + ziggy_message + '"')
      }

      function test_karma(err) {
        t.ok(!err, 'no error')

        db.get(nick || channel, function(err, value) {
          var diff = value - start
          t.equal(
              diff
            , karma
            , (karma < 0 ? 'subtracts' : 'adds') +
              ' ' + Math.abs(karma) + ' karma'
          )

          t.end()
        })
      }

      fake_ziggy.emit('message', {nick: 'al'}, channel, command + ' ' + nick)
    }
  })
}

function check_test(command, channel, nick, ziggy_message, karma) {
  test(command + ' works', function(t) {
    var db = levelup('/lol', {db: memdown})
      , fake_ziggy = new EE()

    db.put(nick || 'lol', karma, finish)

    function finish() {
      karma_plugin(fake_ziggy, db, done)

      t.plan(2)

      fake_ziggy.say = function(to, message) {
        t.equal(to, channel, 'channel is ' + channel)
        t.equal(message, ziggy_message, 'says "' + ziggy_message + '"')
      }

      fake_ziggy.emit('message', {nick: 'al'}, channel, command + ' ' + nick)

      function done() {
        t.end()
      }
    }
  })
}

run_test('!hf', '#narf', 'doofus', 'High five, doofus! Great work!', 10)
run_test('!hf', '#narf', '', 'High five, #narf! Great work!', 10)
run_test('!highfive', '#scarf', 'roofus', 'High five, roofus! Great work!', 10)
run_test('!m', '#wharf', 'goofus', 'You\'re doing great work, goofus!', 1)
run_test(
    '!motivate'
  , '#wharf'
  , 'boofus'
  , 'You\'re doing great work, boofus!'
  , 1
)
run_test('!merit', '#pharf', 'soofus', 'You\'re doing great work, soofus!', 1)
run_test('!merit', '#pharf', '', 'You\'re doing great work, #pharf!', 1)
run_test('!dm', '#tarf', 'zoofus', 'You\'re doing terrible work, zoofus!', -1)
run_test('!dm', '#tarf', '', 'You\'re doing terrible work, #tarf!', -1)
run_test(
    '!demotivate'
  , '#tarf'
  , 'noofus'
  , 'You\'re doing terrible work, noofus!'
  , -1
)
run_test(
    '!demerit'
  , '#tarf'
  , 'moofus'
  , 'You\'re doing terrible work, moofus!'
  , -1
)
run_test('!boo', '#tarf', 'poofus', 'You\'re doing terrible work, poofus!', -1)
run_test(
    '!flog'
  , '#tarf'
  , 'voofus'
  , 'You\'re doing terrible work, voofus! You must be flogged.'
  , -10
)
run_test(
    '!ty'
  , '#narf'
  , 'yoofus'
  , 'Thank you, yoofus, you are a fine human being!'
  , 1
)
run_test(
    '!thanks'
  , '#narf'
  , 'koofus'
  , 'Thank you, koofus, you are a fine human being!'
  , 1
)
run_test(
    '!thanks'
  , '#narf'
  , ''
  , 'Thank you, #narf, you are a fine human being!'
  , 1
)

check_test('!k', '#woo', 'larry', 'larry has 5 karma points!', 5)
check_test('!karma', '#woo', 'harry', 'harry has 1 karma point!', 1)
check_test('!karma', '#woo', '', 'al has 0 karma points!', 0)

test('karma key is case-insensitive', function(t) {
  var db = levelup('/lol', {db: memdown})
    , fake_ziggy = new EE()

  karma_plugin(fake_ziggy, db, test_karma)

  t.plan(3)

  fake_ziggy.say = function(to, message) {
    t.equal(
        message
      , 'You\'re doing great work, HA!'
      , 'message is case-correct'
    )
  }

  function test_karma(err) {
    t.ok(!err, 'no error')

    db.get('ha', function(err, value) {
      t.equal(+value, 1, 'karma added to lower case')
    })
  }

  fake_ziggy.emit('message', {nick: 'al'}, '#a', '!m HA')
})
