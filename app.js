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
    year: "numeric", month: "long",
    day: "numeric"
};

var payment = {
    GrpHdr: {
        MsgId: "Sibos007",
        CredDtTm: "2017-07-12T15:43:10.970",
        NbOfTxs: 1,
        InitgPty: {
            Id: {
                OrgId: {
                    Othr: {
                        Id: "USACUPISP"
                    }
                }
            }
        }
    },
    PmtInf: {
        PmtInfId: "PMTSibos007",
        PmtMtd: "TRF",
        Dbtr: {
            PstlAdr: {
                StrtNm: "5000 E McDowell Rd",
                BldgNb: "12",
                PstCd: "85215",
                TwnNm: "Mesa",
                Ctry: "US"
            },
            Nm: "DE89830944950007009670"
        },
        Cdtr: {
            PstlAdr: {
                StrtNm: "400 Main St",
                BldgNb: "12",
                PstCd: "06118",
                TwnNm: "East Hartford",
                Ctry: "US"
            }
        },
        ChrgBr: "SLEV",
        CdtTrfTx: [
            {
                PmtId: {
                    InstrId: "INSSibos007",
                    EndToEndId: "E2ESibos007"
                },
                Amt: {
                    InstdAmt: "100.45",
                    Ccy: "EUR"
                },
                CdtrAgt: {
                    FinInstnId: {
                        Bicfi: "ROZADEFFXXX"
                    }
                },

                RmtInf: {
                    Ustrd: [
                        "Remmitence Information"
                    ]
                }

            }
        ]
    }
}

const LUIS_MODEL_URL = 'https://eastus2.api.cognitive.microsoft.com/luis/v2.0/apps/aebb4c01-90ba-468e-a66e-d4616b8b8f3c?subscription-key=ecf8d7dbba504d2f8c32414f3fad0135&timezoneOffset=0&verbose=true';

function httpGet(theUrl) {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send();

    return xmlHttp.responseText;
}

function httpPost(theUrl, payment) {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.setRequestHeader("Ocp-Apim-Subscription-Key", "bcf707acdb764c3d8339c3e36877bd29");

    xmlhttp.send(JSON.stringify(payment));

    var paymentstatus = xmlhttp.getResponseHeader("paymentstatus");
    var paymentmid = xmlhttp.getResponseHeader("paymentmid");


    //return paymentstatus;

    return paymentmid;
}

function todayDate() {
    date = new Date(todayDateWithTime());
    year = date.getFullYear();
    month = date.getMonth() + 1;
    dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }

    date = year + '-' + month + '-' + dt;
    return date;

}

function todayDateclear() {
    date = new Date(todayDateWithTime());
    year = date.getFullYear();
    month = date.getMonth() + 1;
    dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }

    date = year.toString().substr(-2) + month.toString() + dt.toString();
    return date;

}

function todayDateWithTime() {
    var d = new Date();
    var n = d.toISOString();
    return n;
}

function createMessageId() {
    var message = "ADN";
    var randomNum = "";

    for (i = 0; i < 7; i++) {
        var random = (Math.floor(Math.random() * 10)).toString();
        randomNum = randomNum + random;
    }

    return message + todayDateclear() + randomNum;


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
    var name = session.message.user.name;
    setTimeout(function () {
        if (name == null) {
            session.endDialog('Hi! How can I help you? ');
        }
        else {
            session.endDialog('Hi %s! How can I help you? ', name, session.message.text);
        }
    }, 3000);
}).triggerAction({
    matches: 'OnDevice.Help'
});

bot.dialog('Greeting', function (session) {
    session.sendTyping();
    setTimeout(function () {
        session.endDialog('I’m fine thank you , How can I help you? ');
    }, 3000);
}).triggerAction({
    matches: 'Greeting'
});


bot.dialog('goodbye', function (session) {
    session.sendTyping();
    setTimeout(function () {
        session.endDialog('Thank you. I hope I managed to serve you well today. Good bye.');
    }, 3000);
}).triggerAction({
    matches: 'goodbye'
});


bot.dialog('ReceivedPayment', function (session, args, results) {
    var companyName = builder.EntityRecognizer.findEntity(args.intent.entities, 'companies').entity;
    const dt_daterange = builder.EntityRecognizer.findEntity(args.intent.entities,
        'builtin.datetimeV2.daterange');
    const startDate = dt_daterange.resolution.values[0]['start'];
    const endDate = dt_daterange.resolution.values[0]['end'];


    // session.send("Yossi said: %s", startDate);
    var service_answer = httpGet("http://51.141.26.55/api/service-payments/creditorPaymentActivationRequests/search/ReceivedPayment?name=" + companyName + "&start=" + startDate + "&end=" + endDate);

    // var obj = JSON.parse(text);
    var obj = JSON.parse(service_answer);
    var start = new Date(startDate);
    session.sendTyping();
    setTimeout(function () {
        if (obj._embedded.creditorPaymentActivationRequests.length == 0) {
            session.endDialog("Sorry, but I did not find any transactions from %s received after %s", firstToUpperCase(companyName), start.toLocaleDateString('en-US', options))
            // session.endDialog("lalala")

        }
        else if (obj._embedded.creditorPaymentActivationRequests.length == 1) {
            session.endDialog("you received only one transaction from %s, to the amount of %s ", firstToUpperCase(companyName), amountCalc(obj, obj._embedded.creditorPaymentActivationRequests.length).toLocaleString('en-US', { style: 'currency', currency: 'USD', }));
        }
        else {
            session.endDialog("You received from %s %d payments, total of %s  ", firstToUpperCase(companyName), obj._embedded.creditorPaymentActivationRequests.length, amountCalc(obj, obj._embedded.creditorPaymentActivationRequests.length).toLocaleString('en-US', { style: 'currency', currency: 'USD', }));
        }
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
    var service_answer = httpGet("http://51.141.26.55/api/service-payments/creditorPaymentActivationRequests/search/ReceivedPaymentBetweenDatesGreaterThanAmount?name=" + companyName + "&start=" + startDate + "&end=" + endDate + "&amount=" + amountAbove);

    // var obj = JSON.parse(text);
    var obj = JSON.parse(service_answer);
    session.sendTyping();
    setTimeout(function () {
        if (obj._embedded.creditorPaymentActivationRequests.length == 0) {
            session.endDialog("Sorry, but I did not find any transactions received from %s between these dates that are above %s", firstToUpperCase(companyName), parseInt(amountAbove).toLocaleString('en-US', { style: 'currency', currency: 'USD' }))
        }
        else if (obj._embedded.creditorPaymentActivationRequests.length == 1) {
            session.endDialog("Yes, you received one transaction from %s above %s on %s ", firstToUpperCase(companyName), parseInt(amountAbove).toLocaleString('en-US', { style: 'currency', currency: 'USD' }), new Date(obj._embedded.creditorPaymentActivationRequests[0].GrpHdr.CredDtTm).toLocaleDateString('en-US', options));
        }
        else {
            session.endDialog("Yes, you received %s transactions from %s above %s. Last transaction dated %s, to the amount of %s",
                obj._embedded.creditorPaymentActivationRequests.length, firstToUpperCase(companyName), parseInt(amountAbove).toLocaleString('en-US', { style: 'currency', currency: 'USD' }), new Date(findLastTransaction(obj, obj._embedded.creditorPaymentActivationRequests.length).GrpHdr.CredDtTm).toLocaleDateString('en-US', options),
                parseInt(findLastTransaction(obj, obj._embedded.creditorPaymentActivationRequests.length).PmtInf.CdtTrfTx[0].Amt.InstdAmt).toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
        }

    }, 3000);

}).triggerAction({
    matches: 'ReceivedPaymentBetweenDatesGreaterThanAmount'
});

bot.dialog('LastPaymentAmount', function (session, args, results) {

    var companyName = firstToUpperCase(builder.EntityRecognizer.findEntity(args.intent.entities, 'companies').entity);
    var spaceIndex = companyName.indexOf(" ");

    if (spaceIndex != -1) {
        companyName = companyName.substr(0, spaceIndex + 1) + companyName.charAt(spaceIndex + 1).toUpperCase() + companyName.substr(spaceIndex + 2);
    }

    var service_answer = httpGet("http://51.141.26.55/api/service-payments/creditorPaymentActivationRequests/search/receivedFrom?name=" + companyName);

    // var obj = JSON.parse(text);
    var obj = JSON.parse(service_answer);
    session.sendTyping();
    setTimeout(function () {
        if (obj._embedded.creditorPaymentActivationRequests.length == 0) {
            session.endDialog("Sorry, but I did not find any transactions received from %s", companyName);
        }
        // else if (obj._embedded.creditorPaymentActivationRequests.length == 1) {
        //     session.endDialog("Yes, you received one transaction from %s above %s on %s ", firstToUpperCase(companyName), parseInt(amountAbove).toLocaleString('en-US', { style: 'currency', currency: 'USD' }), new Date(obj._embedded.creditorPaymentActivationRequests[0].GrpHdr.CredDtTm).toLocaleDateString('en-US', options));

        else {
            session.endDialog("Last time that you received transaction from %s, dated %s, to the amount of %s",
                firstToUpperCase(companyName), new Date(findLastTransaction(obj, obj._embedded.creditorPaymentActivationRequests.length).GrpHdr.CredDtTm).toLocaleDateString('en-US', options),
                parseInt(findLastTransaction(obj, obj._embedded.creditorPaymentActivationRequests.length).PmtInf.CdtTrfTx[0].Amt.InstdAmt).toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
        }

    }, 3000);

}).triggerAction({
    matches: 'LastPaymentAmount'
});


bot.dialog('RequestForPayment', [
    function (session, args, next) {
        session.dialogData.payment = args || {};
        var companyName = firstToUpperCase(builder.EntityRecognizer.findEntity(args.intent.entities, 'companies').entity);
        var spaceIndex = companyName.indexOf(" ");

        if (spaceIndex != -1) {
            companyName = companyName.substr(0, spaceIndex + 1) + companyName.charAt(spaceIndex + 1).toUpperCase() + companyName.substr(spaceIndex + 2);
        }
        const dt_amount = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.number');
        const dt_currency = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.currency');
        var amount = null;
        var currency = null;

        if (dt_amount != null) {
            amount = dt_amount.resolution.value;
        }
        if (dt_currency != null) {
            currency = dt_currency.resolution.unit;
        }


        session.dialogData.payment.companyName = companyName;
        session.dialogData.payment.amount = amount;
        session.dialogData.payment.currency = currency;


        if (session.dialogData.payment.amount == null) {
            session.sendTyping();
            setTimeout(function () {

                builder.Prompts.text(session, "What is the Request for Payment amount?");
            }, 3000);
        }

        else {
            next();
        }
    },


    function (session, results, next) {
        var amount = null;
        var currency = null;

        if (results.response) {
            builder.LuisRecognizer.recognize(results.response, LUIS_MODEL_URL, function (err, intents, entities) {
                if (entities) {
                    var dt_amount = builder.EntityRecognizer.findEntity(entities, 'builtin.number');
                    var dt_currency = builder.EntityRecognizer.findEntity(entities, 'builtin.currency');

                    if (dt_amount != null) {
                        amount = dt_amount.resolution.value;
                    }
                    if (dt_currency != null) {
                        currency = dt_currency.resolution.unit;
                    }

                    session.dialogData.payment.amount = amount;
                    session.dialogData.payment.currency = currency;

                    if (session.dialogData.payment.currency == null) {
                        session.sendTyping();

                        setTimeout(function () {
                            builder.Prompts.text(session, "What is the Request for Payment currency?");
                        }, 3000);
                    } else {
                        next(); // Skip if we already have this info.
                    }
                }
            });
            // const dt_amount = recognizer.recognize(results.response);
            //const dt_currency = builder.EntityRecognizer.findEntity(results.response.intent.entities, 'builtin.currency');


        }

    },


    function (session, results, next) {
        if (results.response) {
            
            
            session.dialogData.payment.currency = results.response;
        }
        if (session.dialogData.payment.addmessage == null) {
            // session.sendTyping();

            // setTimeout(function () {

            //builder.Prompts.text(session, `Any message to add in the request to ${session.dialogData.payment.companyName} ? Yes/No`);
            builder.Prompts.text(session, "Do you want to add a message to the Request for Payment? (Yes/No)");
            // }, 3000);

        } else {
            next(); // Skip if we already have this info.
        }
    },

    function (session, results, next) {
        if (results.response) {
            session.dialogData.payment.addmessage = results.response;
        }
        if (session.dialogData.payment.addmessage.toUpperCase().trim() == "YES") {
            // session.sendTyping();
            // setTimeout(function () {
            //builder.Prompts.text(session, `please type the message to ${session.dialogData.payment.companyName}`);
            builder.Prompts.text(session, "What is the message?");

            // }, 5000);

            next();
        } else {
            next(); // Skip if we already have this info.
        }
    },

    function (session, results, next) {
        if (results.response) {
            session.dialogData.payment.message = results.response;
        }
        if (session.dialogData.payment.confirmed == null) {

            if (session.dialogData.payment.currency == "United States dollar" || session.dialogData.payment.currency == "Dollar") {
                session.dialogData.payment.currency = "USD";
            }

            if (session.dialogData.payment.message) {
                builder.Prompts.text(session, `Okay. I will send a Request for Payment to ${session.dialogData.payment.companyName} for ${session.dialogData.payment.currency} ${session.dialogData.payment.amount} with the message ${session.dialogData.payment.message}. Confirm? (Yes/No)`);
                //    }, 6000);
            }
            else {
                builder.Prompts.text(session, `Okay. I will send a Request for Payment to ${session.dialogData.payment.companyName} for ${session.dialogData.payment.currency} ${session.dialogData.payment.amount}. will be send now. Confirm? (Yes/No)`);
            }

        } else {
            next(); // Skip if we already have this info.
        }
    },

    function (session, results, next) {
        if (results.response) {
            session.dialogData.payment.confirmed = results.response;
        }
        if (session.dialogData.payment.confirmed.toUpperCase().trim() == "YES") {
            var datetoday = todayDate();
            var datetodaytime = todayDateWithTime();
            var messageID = createMessageId();
            payment.PmtInf.Dbtr.Nm = session.dialogData.payment.companyName;
            payment.PmtInf.CdtTrfTx[0].Amt.InstdAmt = session.dialogData.payment.amount;
            payment.PmtInf.CdtTrfTx[0].Amt.Ccy = session.dialogData.payment.currency;
            payment.GrpHdr.MsgId = messageID;
            payment.GrpHdr.CredDtTm = todayDateWithTime;
            payment.PmtInf.PmtInfId = messageID;
            payment.PmtInf.CdtTrfTx[0].PmtId.InstrId = messageID;
            payment.PmtInf.CdtTrfTx[0].PmtId.EndToEndId = messageID;
            payment.PmtInf.CdtTrfTx[0].RmtInf.Ustrd[0] = session.dialogData.payment.message;


            var postAnswer = httpPost("https://sibos01.azure-api.net/psd2/payment-requests", payment);
            // session.sendTyping();


            builder.Prompts.text(session, `Thanks. Request for Payment sent. Please note Confirmation # ${postAnswer}`);


            session.endDialog();
        } else {
            session.endDialog();
            // next(); // Skip if we already have this info.
        }
    },


]).triggerAction({
    matches: 'RequestForPayment'
});