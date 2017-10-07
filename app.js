var restify = require('restify');
var builder = require('botbuilder');
var LuisActions = require('./core');

//var spellService = require('./spell-service');


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "3f21d603-8a8c-4822-9599-de5a9a0f4ded",
    appPassword: "0abR3iSGXevA6DkP8TgAGZz"
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());



 const LUIS_MODEL_URL = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/aebb4c01-90ba-468e-a66e-d4616b8b8f3c?subscription-key=226ff29b37b84885b5185b62652a600c&timezoneOffset=0&verbose=true';

function httpGet(theUrl) {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send();
    
    return xmlHttp.responseText;
}

function myString(myString) {
    var newString = myString.concat(" Dikla");
    return newString;
}

 var lala = myString ("kookoo");

//*******Importent DO Not DELETE****************** */
// var bot = new builder.UniversalBot(connector, function (session) {
//     var hi = httpGet("https://service-hello-world.azurewebsites.net/hello");
//     session.send("Yossi said: %s", hi);
// });


var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
});

var recognizer = new builder.LuisRecognizer(LUIS_MODEL_URL);
bot.recognizer(recognizer);


bot.dialog('OnDevice.Help', function (session) {
    session.endDialog('Hi! My name is Adina, How can i help you? ');
}).triggerAction({
    matches: 'OnDevice.Help'
});

bot.dialog('Greeting', function (session) {
    session.endDialog('i`m fine, thank you , How can i help you? ');
}).triggerAction({
    matches: 'Greeting'
});

bot.dialog('ReceivedPayment', function (session, args,results) {
    var companyName = builder.EntityRecognizer.findEntity(args.intent.entities, 'companies').entity;
    
    //var startDate = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.datetimeV2.daterange');
    //var startDate = builder.EntityRecognizer.recognizeTime(session.message.text).entity;
    const dt_daterange = builder.EntityRecognizer.findEntity(args.intent.entities, 
    'builtin.datetimeV2.daterange');

    const startDate = dt_daterange.resolution.values[0]['start'];
    const endDate = dt_daterange.resolution.values[0]['end'];


    
    // LuisActions.BuiltInTypes.DateTime.Date =

    //var date = LuisActions.extractParametersFromEntities(endDate);
    
   // session.send("Yossi said: %s", startDate);
   
   var service_answer = httpGet("http://service-payments.azurewebsites.net/creditorPaymentActivationRequests/search/ReceivedPayment?name="+companyName+"&start="+startDate+"&end="+endDate);

    session.send("Yossi said: %s", startDate);
    session.send("Yossi said: %s", service_answer);

}).triggerAction({
    matches: 'ReceivedPayment'
});
// bot.matches('ReceivedPayment'[
//         (session, response) => {
//             session.send("Stopping loop.")
//             loop = false;
//         }
//     ])