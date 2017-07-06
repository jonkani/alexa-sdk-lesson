'use strict'

const Alexa = require('alexa-sdk')
const appId = '' // insert app id here

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)

  // this is for test suite purposes
  if (typeof process.env.DEBUG === 'undefined') {
    alexa.appId = appId
  }

  alexa.registerHandlers(handlers)
  alexa.execute()
}

const handlers = {
  'LaunchRequest': function () {
    const speech = 'Welcome to High Roller! Ask me to roll any number of dice!'
    const reprompt = 'Sorry, I didn\'t catch that. Could you repeat the number of dice that you wanted me to roll?'

    this.emit(':ask', speech, reprompt)
  },
  'RollIntent': function () {
    // rolling happens here
  },
  'AMAZON.HelpIntent': function () {
    const speech = 'Ask me to roll some number of dice. For example, "roll three dice."'
    const reprompt = speech

    this.emit(':ask', speech, reprompt)
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
