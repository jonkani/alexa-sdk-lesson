'use strict'

const Alexa = require('alexa-sdk')
const appId = ''

exports.handler = function (event, context, callback) {
  var alexa = Alexa.handler(event, context)

  if (typeof process.env.DEBUG === 'undefined') {
    alexa.appId = appId
  }
  alexa.registerHandlers(handlers)
  alexa.execute()
}

const handlers = {
  'LaunchRequest': function () {
    this.attributes['speechOutput'] = 'Welcome to High Roller! Ask me to roll any number of dice!'
    this.attributes['repromptOutput'] = 'Sorry, I didn\'t catch that. Could you repeat the dice that you want me to roll?'

    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  },
  'RollIntent': function () {
    // roll some dice here
  },
  'AMAZON.HelpIntent': function () {
    this.attributes['speechOutput'] = 'Ask me to roll some number of dice. This isn\'t hard.'
    this.attributes['repromptOutput'] = this.attributes['speechOutput']

    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  },
  'AMAZON.RepeatIntent': function () {
    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  },
  'AMAZON.StopIntent': function () {
    this.emit('SessionEndedRequest')
  },
  'AMAZON.CancelIntent': function () {
    this.emit('SessionEndedRequest')
  },
  'SessionEndedRequest': function () {
    this.emit(':tell', 'Goodbye!')
  }
}
