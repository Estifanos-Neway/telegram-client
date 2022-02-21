import { Airgram, Auth, prompt } from 'airgram';
import 'dotenv/config';
import { myGender, knownChatsIdentifier, knownChatIds, maxChatLimit } from './variables.js';
import {getChats, logOut} from "./modules/api_methods.js";

//-> local variables
let thisUserName, thisUserPhone, thisUserId;
let thisUserGenderPronoun = myGender == "male"? "he":"she";
let userIds = [
    1252131215,  334744434,  348129214,  626508656,  308921082,
    1398598219, 1430570511,  285345034,  353507049,  397025661,
     811135596, 1083221458, 1658560292,  674866794,  905265518,
    1232957677, 1889035024,  708360394,  678362501, 1994494910,
    5034670804, 5015841136,  880343867,  941012540, 5164845451,
    1894819301, 1613123613, 1622222152, 1660850974, 1665939895,
    1745818931, 1825690002, 1829441751, 1858287550, 1864019232,
    1930562363, 1932658119, 1947559304, 1954608401, 1957527558,
    1960544632, 1971229483, 1983536706, 2068520150, 2073059599,
    2107768218, 2124719165, 5068181420, 5185445098, 5192239978,
    5282818586,  276249123,  409633716,  426456524,  428806852,
     482085910,  537113137,  546437062,  572733832,  576243844,
     577418047,  650155325,  669258509,  684792702,  724609587,
     726348773,  729747320,  742830690,  743682137,  748034433,
     771337251,  772902822,  782399633,  796367056,  803866452,
     822271415,  825420092,  857567021,  874469308,  891612413,
     919457878,  924310240,  931545967,  934936988,  986306709,
    1007801925, 1045012933, 1066955512, 1092739852, 1096761170,
    1128453122, 1147405501, 1150758152, 1182454509, 1247477519,
    1285613695, 1577750123, 1944785967, 1330147219, 5259389355
  ];
const airgram = new Airgram({
  apiId: process.env.APP_ID,
  apiHash: process.env.APP_HASH,
  command: process.env.TDLIB_COMMAND,
  logVerbosityLevel: 2
})

//-> function declarations
async function newMessageHandler(ctx, next) {
    let message = ctx.update.message;
    if(!message.isOutgoing){
        let chatId = message.chatId;
        if(chatId in knownChatIds){
            let senderName = knownChatIds[chatId];
            let newMessageText = `Hi ${senderName}, I am ${thisUserName}'s bot. ${(thisUserName.slice(0,1)).toUpperCase()}${thisUserName.slice(1)} is not around at the moment, but ${thisUserGenderPronoun} will comeback soon. Thank you 😊`
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

            console.log(`Known Chat from ${knownChatIds[chatId]}.`)
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
    } else{
        if(message.content._ == "messageText"){
            if(message.content.text.text.startsWith(knownChatsIdentifier)){
                let messageId = message.id;
                let chatId = message.chatId;
                let receiversName = message.content.text.text.slice(1);
                console.log(`${chatId}:${receiversName}`)
            }
        }
    }
    return next();
}

//-> setting middleware's
airgram.use(new Auth({
  code: () => prompt(`Please enter the secret code:\n`),
  phoneNumber: () => prompt(`Please enter your phone number:\n`)
}))

// airgram.on("updateNewMessage",newMessageHandler);

//-> executions starts here
airgram.api.getMe().then((me)=>{
    thisUserId = me.response.id;
    thisUserName = knownChatIds[thisUserId]??me.response.firstName;
    thisUserPhone = me.response.phoneNumber;
    console.log(`Hey ${thisUserName}, (Phone: +${thisUserPhone} | Id: ${thisUserId}).`);
})

// logOut(airgram).then(result => console.log(result));

getChats(airgram).then(result => {
    if(result[0]){
        // console.log(result[1].response.chatIds);
        
        // airgram.api.getChat({chatId:-1001458890556}).then(result=>console.log(result.response.positions));
        
        // airgram.api.getChat({chatId:-1001726244201}).then(result=>console.log(result));
        
        // airgram.api.getSupergroupMembers({supergroupId:1458890556,filter:null,offset:0,limit:100}).then(result=>{
            // let users = result.response.members.map(user=>user.memberId.userId);
            
            // console.log(users);
            // users.forEach(user=>{
            //     airgram.api.addChatMember({chatId:-1001726244201,userId:user,forwardLimit:0}).then(result=>console.log(result));
            // })

            // airgram.api.addChatMembers({chatId:-1001725178681,userIds:users}).then(result=>console.log(result));
            
            // console.log("adding");
        // });
        // airgram.api.addChatMembers({chatId:-1001726244201,userIds:userIds}).then(result=>console.log(result));
    } else{
        console.log(result);
    }
});

// airgram.api.getRecommendedChatFilters().then(result=>console.log(result.response.chatFilters));
// airgram.api.getChat({chatId:808280781}).then(result=>console.log(result));
// airgram.api.getSupergroupMembers({supergroupId:1154530911,filter:null,offset:0,limit:20}).then(result=>console.log(result));
// airgram.api.getChatFilter({chatFilterId:0}).then(result=>console.log("[0]",result));
// airgram.api.getChatFilter({chatFilterId:1}).then(result=>console.log("[1]",result));

airgram.api.createChatFilter({filter:{title:".",iconName:"Trade",includeGroups:true}}).then(result=>{
    let id = result.response.id;
    airgram.api.getChats({chatList:{_:"chatListFilter",chatFilterId:id},limit:maxChatLimit}).then(result=>{
        console.log(result);
    }).finally(()=>{
        airgram.api.deleteChatFilter({chatFilterId:id})
    })
});

// airgram.api.deleteChatFilter({chatFilterId:21}).then(result=>console.log("[G]",result));

// airgram.on("updateNewMessage",(ctx,next)=>{
//     let message = ctx.update.message;
//     if(message.isOutgoing){
//         if(message.content._ == "messageText"){
//             if(message.content.text.text.startsWith(knownChatsIdentifier)){
//                 console.log(message);
//             }
//         }
//     }
//     return next();
// })