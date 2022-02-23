import { Airgram, Auth, prompt } from 'airgram';
import 'dotenv/config';
import { getGroups, logOut, transferMembers } from "./modules/api_methods.js";

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

getGroups(airgram).then(async result => {
    // if (!result[0]) {
    //     console.log(result);
    // } else {
    //     result[1].forEach(async group => {
    //         group = await group;
    //         console.log(group)
    //     });
    // }
    
    for await (let transferMembersYield of transferMembers(airgram, 1263229876, -1001726244201,10)){
        if(!transferMembersYield[0]){
            console.log(transferMembersYield[1]);
        } else{
            console.log(" ")
            console.log(new Date());
            console.log(" ")
            console.log(`${transferMembersYield[1].addsCount} | ${transferMembersYield[1].totalAddsCount}`);
            console.log("failed: ");
            for (let failedAdd of transferMembersYield[1].failedAdds){
                console.log(failedAdd.reason);
            }
        }
        // console.log(transferMembersYield[0],transferMembersYield[1]);
    }
})
// logOut(airgram).then(r=>console.log(r));
