const tmi = require('tmi.js');
var firebase = require("firebase");
require('dotenv').config()
var http = require('http');


var firebaseConfig = {
  apiKey: process.env.API_KEY ,
  authDomain: process.env.AUTH_DOMAIN ,
  databaseURL: process.env.DATABASE_URL ,
  projectId: process.env.PROJECT_ID ,
  storageBucket:process.env.STORAGE_BUCKET ,
  messagingSenderId: process.env.MESSAGING_SENDER_ID ,
  appId: process.env.APP_ID,
  measurementId:process.env.MEASUREMENT_ID
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var bet = {};
let jug1="!mango";
let jug2="!hbox";
const opts = {
  identity: {
    username: "supersmashbets",
    password: process.env.PASSWORD
  },
  channels: [
    "slowking_0",
  ]
};
const client = new tmi.client(opts);
client.on('message', onMessageHandler);
opts.channels.forEach(canal => {
  bet[canal]=false;  
});
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot
    const user=context.username;
    const commandName = msg.trim();
    switch(commandName){
        case '!join': 
            const itJoin = join(user,target);
        break;
        case '!reset':
            const itReset= reset(user,target);
        break;
        case '!points':
            const myPoints=points(user,target);
        break;
        case jug1:
          client.say(target, `@${user} player1 is ${jug1}`);
        break;
        case jug2:
          client.say(target, `@${user} player1 is ${jug1}`);
        break;
    }
    if (commandName.includes("!configure")){
      configure(user,target,commandName);
    }
}
function bet(user,target,message){

}
function configure(user,target,message){
  console.log("here!")
  var url = 'http://tmi.twitch.tv/group/user/'+target.substring(1)+'/chatters';
  var req =http.get(url, function(res){
    var body = '';
    res.on('data', function(chunk){
        body += chunk;
    });
    res.on('end', function(){
        var response = JSON.parse(body);
        if ((user in response.chatters.moderators) || user =="slowking_0"){
          message.split(" ");
          jug1=message[1];
          jug2=message[2];
          client.say(target, `@${user} Done!`);
        }
    });
    }).on('error', function(e){
          console.log("Got an error: ", e);
    });
    req.end();
}
function join (user,target) {
  firebase.database().ref("usuarios/"+user).once("value", snapshot => {
    if (!snapshot.exists()){
      firebase.database().ref("usuarios/"+user).set({
        points: 2000,
      });
      client.say(target, `@${user} you have 2000 points now`);
    }else{
      client.say(target, `@${user} you have already joined`);
    }  
  });
}
function reset(user,target){
  firebase.database().ref("usuarios/"+user).once("value", snapshot => {
    if (snapshot.exists()){
      firebase.database().ref("usuarios/"+user).set({
        points: 2000,
      });
      client.say(target, `@${user} you reset your points! you have 2000 points now`);
    }else{
      client.say(target, `@${user} pls use !join :)`);
    }  
  });
}
function points(user,target){
  firebase.database().ref("usuarios/"+user).once("value", snapshot => {
    if (snapshot.exists()){
      firebase.database().ref("usuarios/"+user+"/points").on("value", function(snapshot) {
        client.say(target, `@${user} you have ${snapshot.val()} points!`);
      })
    }else{
      client.say(target, `@${user} pls use !join :)`);
    }  
  });
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}