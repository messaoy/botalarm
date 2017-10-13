var restify = require('restify');
var botbuilder = require('botbuilder');
const currentDate = Date.now();
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function(){
	console.log('%s bot started at %s', server.name, server.url);
});

var connector = new botbuilder.ChatConnector({
	appId: process.env.APP_ID,
	appPassword: process.env.APP_SECRET
});

var menuItems = {
    "Créer une alarme": {
        item: "createAlarmOption"
    },
    "Consulter toutes mes alarmes": {
        item: "showAllAlarmOption"
    },
    "Consulter mes alarmes actives": {
        item: "showActiveAlarmOption"
    },
};

server.post('/api/messages', connector.listen());

var bot = new botbuilder.UniversalBot(connector, [
	function (session) {
        session.conversationData.alarms = new Array();
		session.send('Gestion de vos alarmes.');
		session.beginDialog("mainMenu");
	},
	function (session, results) {

    }
]);

bot.dialog("mainMenu", [
    function(session){
        botbuilder.Prompts.choice(session, "Menu:",
			menuItems, { listStyle: botbuilder.ListStyle.button });
    },
    function(session, results){
        if(results.response)
        {
            session.beginDialog(menuItems[results.response.entity].item);
        }
    }
]);

bot.dialog('createAlarmOption', [
	function (session) {
		session.send('Création d\'alarme.')
        botbuilder.Prompts.text(session, "Nom de l'alarme ? ");
	},
	function (session, results) {
		session.conversationData.alarmName = results.response;
		botbuilder.Prompts.time(session, "Date de l'alarme ?");
	},
	function (session, results) {
        session.conversationData.alarmDate = botbuilder.EntityRecognizer.resolveTime([results.response]);
        session.conversationData.alarms.push({
            title: session.conversationData.alarmName,
            date: session.conversationData.alarmDate
        });
        session.send('Votre alarme a été crée.');
        session.replaceDialog("mainMenu");
	}
]);

bot.dialog('showAllAlarmOption', [
	function (session) {
		session.send('Voici toutes vos alarmes:');
		if(session.conversationData.alarms) {
			session.conversationData.alarms.forEach(function(element) {
                session.send(` Nom de l'alarme : ${element.title} <br/> Date de l'alarme: ${element.date} <br/>`);
			}, this);
		} else {
			session.send('Vous n\'avez pas alarme active.')
		}
        session.replaceDialog("mainMenu");
	},
]);

bot.dialog('showActiveAlarmOption', [
	function (session) {
        session.send('Voici toutes vos alarmes actives:');
		if(session.conversationData.alarms) {            
			session.conversationData.alarms.forEach(function(element) {
				if (Date.parse(element.date) > currentDate) {
					session.send(` Nom de l'alarme : ${element.title} <br/> Date de l'alarme: ${element.date} <br/>`);
				}
			}, this);
		} else {
			session.send('Vous n\'avez pas alarme.');
		}
        session.replaceDialog("mainMenu");
	}
]);
