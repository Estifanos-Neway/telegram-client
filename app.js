import { Airgram, Auth, prompt, toObject } from 'airgram'
import 'dotenv/config';
import { KnownChatIds, myGender } from './variables.js';

//local variables
let thisUserName, thisUserPhone, thisUserId;
let thisUserGenderPronoun = myGender == "male"? "he":"she";

const airgram = new Airgram({
  apiId: process.env.APP_ID,
  apiHash: process.env.APP_HASH,
  command: process.env.TDLIB_COMMAND,
  logVerbosityLevel: 2
})

//function declarations
function newMessageHandler(ctx, next) {
    let message = ctx.update.message;
    if(!message.isOutgoing){
        let chatId = message.chatId;
        if(chatId in KnownChatIds){
            let senderName = KnownChatIds[chatId];
            let newMessageText = `Hi ${senderName}, I am ${thisUserName}s bot. ${thisUserName} is not around at the moment, but ${thisUserGenderPronoun} will comeback soon. Thank you 😊`
            let SendMessageParams = {
                chatId: chatId,
                inputMessageContent: {
                    "_":"inputMessageText",
                    text: {
                        "_":"formattedText",
                        text: newMessageText
                    }
                }
            }

            console.log(`Known Chat from ${KnownChatIds[chatId]}.`)
            airgram.api.sendMessage(SendMessageParams).then(
                (result) => {
                    let responseType = result.response._;
                    if(responseType != "error"){
                        console.log(`Successful response to ${senderName}.`);
                    } else{
                        console.error(`Error while responding to ${senderName}.`);
                        console.error(`[Error]: ${result.response}.`);
                    }
                }
            ).catch(
                (error) => {
                    console.error("s:error: ", error);
                }
            )
        };
    }
    return next();
}

// setting middleware's
airgram.use(new Auth({
  code: () => prompt(`Please enter the secret code:\n`),
  phoneNumber: () => prompt(`Please enter your phone number:\n`)
}))

airgram.on("updateNewMessage",newMessageHandler);

// executions starts here
airgram.api.getMe().then((me)=>{
    thisUserId = me.response.id;
    thisUserName = KnownChatIds[thisUserId]??me.response.firstName;
    thisUserPhone = me.response.phoneNumber;
    console.log(`Hey ${thisUserName}, (Phone: +${thisUserPhone} | Id: ${thisUserId}).`);
})

