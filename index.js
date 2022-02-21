import { Airgram, Auth, prompt } from 'airgram';
import 'dotenv/config';
import { getGroups, transferMembers } from "./modules/api_methods.js";

//-> local variables
let thisUserName, thisUserPhone, thisUserId;
const airgram = new Airgram({
    apiId: process.env.APP_ID,
    apiHash: process.env.APP_HASH,
    command: process.env.TDLIB_COMMAND,
    logVerbosityLevel: 0
})
//-> setting middleware's
airgram.use(new Auth({
    code: () => prompt(`Please enter the secret code:\n`),
    phoneNumber: () => prompt(`Please enter your phone number:\n`)
}))

//-> executions starts here
airgram.api.getMe().then((me) => {
    thisUserId = me.response.id;
    thisUserName = me.response.firstName;
    thisUserPhone = me.response.phoneNumber;
    console.log(`Hey ${thisUserName}, (Phone: +${thisUserPhone} | Id: ${thisUserId}).`);
})

getGroups(airgram).then(result => {
    // console.log(result[1]);
    transferMembers(airgram, 1458890556, -1001726244201).then(result => {
        console.log(result);
    }
    )
})