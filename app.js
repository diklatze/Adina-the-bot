var restify = require('restify');
var builder = require('botbuilder');
//var LuisActions = require('./core');

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

var options = {
    year: "numeric", month: "short",
    day: "numeric"
};

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



function amountCalc(obj, length) {
    var sum = 0;
    for (i = 0; i < length; i++) {
        sum = sum + parseInt(obj._embedded.creditorPaymentActivationRequests[i].PmtInf.CdtTrfTx[0].Amt.InstdAmt)
    }

    return sum;
}

function firstToUpperCase(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function findLastTransaction(obj, length) {
    var recentPayment;
    //var maxDate = new Date("1000-01-01");
    var maxDate = new Date(1000, 1, 1, 0, 0, 0, 0);
    for (i = 0; i < length; i++) {
        const currDate = new Date(obj._embedded.creditorPaymentActivationRequests[i].GrpHdr.CredDtTm);
        //console.log("#################### DATE - " + currDate.toString())
        if (currDate > maxDate) {
            maxDate = currDate;
            recentPayment = obj._embedded.creditorPaymentActivationRequests[i];
        }
    }
    return recentPayment;


}
// var date_sort_desc = function (date1, date2) {
//     // This is a comparison function that will result in dates being sorted in
//     // DESCENDING order.
//     if (date1 > date2) return -1;
//     if (date1 < date2) return 1;
//     return 0;
//   };

var lala = myString("kookoo");

//*******Importent DO Not DELETE****************** */
// var bot = new builder.UniversalBot(connector, function (session) {
//     var hi = httpGet("https://service-hello-world.azurewebsites.net/hello");
//     session.send("Yossi said: %s", hi);
// });


var bot = new builder.UniversalBot(connector, function (session) {
    session.sendTyping();
    setTimeout(function () {
        session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
    }, 3000);

});

var recognizer = new builder.LuisRecognizer(LUIS_MODEL_URL);
bot.recognizer(recognizer);


bot.dialog('OnDevice.Help', function (session) {
    session.sendTyping();
    setTimeout(function () {
        session.endDialog('Hi! My name is Adina, How can i help you? ', session.message.text);
    }, 3000);
}).triggerAction({
    matches: 'OnDevice.Help'
});

bot.dialog('Greeting', function (session) {
    session.sendTyping();
    setTimeout(function () {
        session.endDialog('i`m fine, thank you , How can i help you? ');
    }, 3000);
}).triggerAction({
    matches: 'Greeting'
});

bot.dialog('ReceivedPayment', function (session, args, results) {
    var companyName = builder.EntityRecognizer.findEntity(args.intent.entities, 'companies').entity;
    const dt_daterange = builder.EntityRecognizer.findEntity(args.intent.entities,
        'builtin.datetimeV2.daterange');
    const startDate = dt_daterange.resolution.values[0]['start'];
    const endDate = dt_daterange.resolution.values[0]['end'];


    // session.send("Yossi said: %s", startDate);
    var service_answer = httpGet("http://service-payments.azurewebsites.net/creditorPaymentActivationRequests/search/ReceivedPayment?name=" + companyName + "&start=" + startDate + "&end=" + endDate);

    // var obj = JSON.parse(text);
    var obj = JSON.parse(service_answer);
    var start = new Date(startDate);
    session.sendTyping();
    setTimeout(function () {
        if (obj._embedded.creditorPaymentActivationRequests.length == 0) {
            session.endDialog("Sorry, I did not find any transaction from %s since %s", firstToUpperCase(companyName), start.toLocaleDateString('en-US', options))
        }
        else if (obj._embedded.creditorPaymentActivationRequests.length == 1) {
            session.endDialog("you received only one transaction from %s ,to the amount of %s ", firstToUpperCase(companyName), amountCalc(obj, obj._embedded.creditorPaymentActivationRequests.length).toLocaleString('en-US', {  style: 'currency',  currency: 'USD',}));
        }
        else{
        session.endDialog("You received from %s %d payments, total of %s  ", firstToUpperCase(companyName), obj._embedded.creditorPaymentActivationRequests.length, amountCalc(obj, obj._embedded.creditorPaymentActivationRequests.length).toLocaleString('en-US', {  style: 'currency',  currency: 'USD',}));}
        //session.send("Yossi said: %s", obj._embedded.creditorPaymentActivationRequests.length);
    }, 3000);

}).triggerAction({
    matches: 'ReceivedPayment'
});

bot.dialog('ReceivedPaymentBetweenDatesGreaterThanAmount', function (session, args, results) {
    var companyName = builder.EntityRecognizer.findEntity(args.intent.entities, 'companies').entity;
    const dt_daterange = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.datetimeV2.daterange');
    const dt_amount = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.number');

    const startDate = dt_daterange.resolution.values[0]['start'];
    const endDate = dt_daterange.resolution.values[0]['end'];
    const amountAbove = dt_amount.resolution.value;
    // session.send("Yossi said: %s", startDate);
    var service_answer = httpGet("http://service-payments.azurewebsites.net/creditorPaymentActivationRequests/search/ReceivedPaymentBetweenDatesGreaterThanAmount?name=" + companyName + "&start=" + startDate + "&end=" + endDate + "&amount=" + amountAbove);

    // var obj = JSON.parse(text);
    var obj = JSON.parse(service_answer);
    session.sendTyping();
    setTimeout(function () {
        if (obj._embedded.creditorPaymentActivationRequests.length == 0) {
            session.endDialog("Sorry, no transactions received from %s between these dates that are above %s", firstToUpperCase(companyName), parseInt(amountAbove).toLocaleString('en-US', {  style: 'currency',  currency: 'USD'}))
        }
        else if (obj._embedded.creditorPaymentActivationRequests.length == 1) {
            session.endDialog("Yes, you received one transaction from %s ,above %s ", firstToUpperCase(companyName), parseInt(amountAbove).toLocaleString('en-US', {  style: 'currency',  currency: 'USD'}));
        }
        else{
        session.endDialog("Yes, you received %s transactions from %s ,above %s . Last transaction dated %s, to the amount of %s",
            obj._embedded.creditorPaymentActivationRequests.length, firstToUpperCase(companyName), parseInt(amountAbove).toLocaleString('en-US', {  style: 'currency',  currency: 'USD'}), new Date(findLastTransaction(obj, obj._embedded.creditorPaymentActivationRequests.length).GrpHdr.CredDtTm).toLocaleDateString('en-US', options), 
            parseInt(findLastTransaction(obj, obj._embedded.creditorPaymentActivationRequests.length).PmtInf.CdtTrfTx[0].Amt.InstdAmt).toLocaleString('en-US', {  style: 'currency',  currency: 'USD'}));}
        
    }, 3000);

}).triggerAction({
    matches: 'ReceivedPaymentBetweenDatesGreaterThanAmount'
});