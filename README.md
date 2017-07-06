## I Can Alexa and So Can You
Have you ever spent an afternoon shouting at a computer and wishing it would just do the thing you said? Have you giggled to yourself after making a voice synthisizer repeat "doo doo" for minutes straight? Have you wished that there was an intersection of the two preceding things packaged in a handy JavaScript SDK?

Well, dear reader, I have good news about your increasingly specific wishes. Amazon has a Node SDK for their Alexa Skills Kit, and it significantly reduces the learning curve for getting your hands dirty with Alexa Skills. To go over the basics, we're going to put together a simple dice-rolling skill.

### Getting Started
Clone this repo and run 
```npm install```
from within the src folder. You'l also want to install a quick and dirty Alexa skill tester globally, so run
```npm install -g alexa-skill-test```
after the first part's done. 
Next, you'll need to have a couple accounts for publishing purposes: an [Amazon developer account](https://developer.amazon.com) and an [AWS account](https://aws.amazon.com/).

### Alexa Basics

#### Words Words Words
There are three pieces of vocabulary that are pretty essential to understanding Alexa: utterances, intents, and slots.

##### Utterances
These are the words a user says to Alexa to ask her to do something or provide a response to a question she asked. If a user wanted to use the Domino's skill to order a pizza, they might say:

> Alexa, ask Domino's to order me a pizza

But similar utterances could have the same result:

>ask Domino's to get me a pizza

>open Domino's and order a pizza

>tell Domino's that unless I have a pizza on my doorstep in the next 15 minutes I swear to God

etc.

When creating a skill, you'll give Alexa a list of sample utterances. They come attached to a particular intent (which we'll get to momentarily) that are used by Alexa to generate a larger list of possible utterances. It should look something like this:

```
OrderPizzaIntent i want a pizza
OrderPizzaIntent order a pizza
OrderPizzaIntent get me a pizza
```

These utterances should be a varied cross-section of possble ways for a user to make a request. You're not looking to account for every possible change in wording - that's Alexa's job.

##### Intents
Intents are the ultimate request that a user's utterence maps to. That is, ordering a pizza, changing an address, or opening the pod bay doors. As mentioned above, a single intent can be triggered by a variety of similar utterences - both by the sample utterences and their derivations.

Along with said sample utterences, you'll create an intent schema that tells Alexa which intents you're using. Alexa has a number of built-in intents that don't require sample utterences (things like an intent to ask for help or an intent to cancel) that you can take advantage of, but you're going to need some number of custom intents to make your skill go. The good news is that this is as easy as adding a new intent name to your schema and listing which slots you're using. We'll get to what that looks like once we've covered the final piece, which brings us to...

##### Slots
Slots are the user-supplied arguments for an intent. In other words, they're the extra details a user says with the utterance to give Alexa more information about what the user's request. For example,
> order me a {*pepperoni*} pizza

> which movies are playing at the {*majestic bay*}

> set phasers to {*kill*}

Slots aren't entirely open-ended; you provide a list of values that the Alexa's speech recognition is weighted towards, but it's not entirely constraied to said list (so error-handling becomes important for when a user tries to set phasers to pepperoni). Amazon provides a number of default slots, covering such things as numbers, city names, and comic book titles, but if you have needs that aren't covered by the defaults, you'll have to provide your own slot type and values to the skill (which is about as easy as making a custom intent).

So, let's take a look at that schema:
```javascript
{"intents": [
    {"intent": "VolumeIntent", "slots": [{"name": "Volume", "type": "AMAZON.NUMBER"}]},
    {"intent": "AMAZON.YesIntent"},
    {"intent": "AMAZON.NoIntent"},
  ]
}
```
Here, we're taking advantage of a couple default intents (which you may recognize from the all-caps AMAZON), and creating one of our own. An intent can have multiple slots - we just add to the array. 

#### Boilerplate
Now that we've got terminology out of the way, let's take a look a what it takes to get started.
```javascript
const Alexa = require('alexa-sdk')

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)

  alexa.registerHandlers(handlers)
  alexa.execute()
}
```
So, what's going on after we require in Alexa? First, we're creating an `alexa` object to work with, then we register our intent handlers using, appropriately enough, `registerHandlers()`, and finally, we tell the `alexa` object to execute the skill with `execute()`. That's it! As you may have surmised, most of the work is going to be done by our handlers. In this example, we're not going to get particularly complex, but it's worth noting that we can register more than one handler at once, like so:
```javascript
alexa.registerHandlers(handler1, handler2, handler3)
```

#### HANDLE IT
Let's look at some of the intents handlers our handlers object might consist of.
```javascript
const handlers = {
  'LaunchRequest': function () {
    const speech = 'Welcome to This Example! You can ask me questions like, "what?" or "just, why?". ' +
    'What would you like to know?'
    const reprompt = 'Sorry, I didn\'t catch that. Ask me the thing again.'

    this.emit(':ask', speech, reprompt)
  }
}
```
Let's focus on the `this.emit()` first, because it's how responses to the user are generated and sent. When we emit using `:ask`, we wait for the user to provide more input; when we emit with `:tell`, we finish the session and don't care about anything else the user might have to say. As you can see here, when we use `:ask`, we provide an initial bit of speech and an extra piece to reprompt the user if they don't say anything that can be mapped to an intent before Alexa gets tired of waiting. With `:tell`, we only need the inital string, because we don't have to prompt the user for any more information.

`:ask` and `:tell` aren't the only arguments `this.emit()` can take - there are things like `:tellWithCard`, which will also create a "card" that appears on the user's Alexa app, or `:confirmIntent`, for times when you want to be extra sure that the user wants to order a pizza, and not, say, a healthy salad. You can even emit other intent handlers - more on that in a moment. 

"LaunchRequest" is a special handler that's used if the user starts using a skill without a specific invocation (by saying something like "open [skill name]", for example). This is required by the certification process, and should say the skill's name and provide a *consise* overview of what the user can do, hopefully with an example prompt or two.

Let's take a look a couple other required required handlers - stop and cancel.
```javascript
'AMAZON.StopIntent': function () {
  this.emit('SessionEndedRequest')
},
'AMAZON.CancelIntent': function () {
  this.emit('SessionEndedRequest')
},
'SessionEndedRequest': function () {
  this.emit(':tell', 'Goodbye!')
}
```
Hey, it's more default intents! `StopIntent` and `CancelIntent` will catch a wide variety of user utterences to terminate the skill and route them to our `SessionEndedRequest` handler, which just uses a `:tell` to offer a cordial farewell and stop listening for input, ending the skill. Remember when I said you could emit other handlers? It's as easy as using the handler name as the first argument. 

Asute observers might ask why we're using `StopIntent` and `CancelIntent` interchangably and what the difference is between them. In short, they correspond to different utterences, but unless you have a good reason for differentiating them, Amazon suggests that you treat them the same. If you really want the words "stop" and cancel" to mean different things to your skill, that's a thing you can do, though it may make getting through certification a little harder.

The final required intent is `AMAZON.HelpIntent`, which is where you can offer some more in-depth instruction to your user and provide a few more example utterences to get them started. It doesn't use any different syntax from what we've looked at already, so without further ado, let's get to the skill building!
