
import { maxChatLimit, defaultGroupsFolderTitle, defaultGroupsFolderIconTitle } from "../variables.js"

//-> basic methods
async function getChats(airgramInstance, chatList = null, limit = maxChatLimit) {
    try {
        let result = await airgramInstance.api.getChats({ chatList, limit });
        if (result._ == "error" || result.response._ == "error") {
            return [false, result];
        }
        return [true, result];
    } catch (error) {
        return [false, error]
    }
}

//->-> authentications
async function logOut(airgramInstance) {
    try {
        let result = await airgramInstance.api.logOut();
        if (result._ == "error" || result.response._ == "error") {
            return [false, result];
        }
        return [true, result];
    } catch (error) {
        return [false, error]
    }
}

//-> derived methods
async function getDetailedChat(airgramInstance, chatId) {
    try {
        let result = await airgramInstance.api.getChat({ chatId });
        if (result._ == "error" || result.response._ == "error") {
            return [false, result.response];
        }
        return [true, result.response];
    } catch (error) {
        return [false, error]
    }
}

async function getGroups(airgramInstance, limit = maxChatLimit) {
    let params = {
        filter: {
            title: defaultGroupsFolderTitle,
            iconName: defaultGroupsFolderIconTitle,
            includeGroups: true
        }
    };
    try {
        let chatFilter = await airgramInstance.api.createChatFilter(params);
        if (chatFilter._ == "error" || chatFilter.response._ == "error") {
            return [false, chatFilter.response];
        }
        let id = chatFilter.response.id;
        let chatList = {
            _: "chatListFilter",
            chatFilterId: id
        }
        let groups = await getChats(airgramInstance, chatList, limit);
        airgramInstance.api.deleteChatFilter({ chatFilterId: id });
        if (!groups[0]) {
            return groups;
        }
        let groupsInfo = groups[1].response.chatIds;
        groupsInfo = groupsInfo.map(async groupId => {
            let fullGroupInfo = {};
            fullGroupInfo.id = groupId;
            let groupDetail = await getDetailedChat(airgramInstance, groupId);
            if (!groupDetail[0]) {
                fullGroupInfo.error = groupDetail[1];
                return [false, fullGroupInfo];
            }
            fullGroupInfo.supergroupId = groupDetail[1].type.supergroupId;
            fullGroupInfo.title = groupDetail[1].title;
            fullGroupInfo.canInviteUsers = groupDetail[1].permissions.canInviteUsers;
            return [true, fullGroupInfo];
        });
        groupsInfo = await Promise.all(groupsInfo);
        return [true, groupsInfo];
    } catch (error) {
        return [false, error];
    }
}

async function transferMembers(airgramInstance, from, to, limit) {
    try {
        let supergroupMembersResult = await airgramInstance.api.getSupergroupMembers({supergroupId:from,filter:null,offset:0,limit:100});
        if (supergroupMembersResult._ == "error" || supergroupMembersResult.response._ == "error") {
            return [false, supergroupMembersResult];
        }
        let userIds = supergroupMembersResult.response.members.map(member => member.memberId.userId);
        let addMembersResult = await airgramInstance.api.addChatMembers({chatId:to,userIds});
        if (addMembersResult._ == "error" || addMembersResult.response._ == "error") {
            return [false, addMembersResult];
        }
        return [true, addMembersResult];
    } catch (error) {
        return [false, error]
    }
}

export { getChats, logOut, getGroups, transferMembers };
