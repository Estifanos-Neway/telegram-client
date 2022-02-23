
import { maxChatLimit, defaultGroupsFolderTitle, defaultGroupsFolderIconTitle } from "../variables.js"

//-> basic methods
async function getChat(airgramInstance, chatId) {
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

async function* getSupergroupMembers(airgramInstance, supergroupId, maxCount, offset = 0, defaultLimit = 200, filter = null) {
    let limit = defaultLimit;
    let errorFlag, members;
    let count = 0;
    while (!maxCount || count < maxCount) {
        if (maxCount && count + limit > maxCount) {
            limit = maxCount - count;
        }
        try {
            let supergroupMembersResult = await airgramInstance.api.getSupergroupMembers({ supergroupId, filter, offset, limit });
            if (supergroupMembersResult._ == "error" || supergroupMembersResult.response._ == "error") {
                errorFlag = result;
                break;
            }
            members = supergroupMembersResult.response.members;
            if (members == []) {
                break;
            } else {
                yield [true, members];
                offset += limit;
                count += limit;
            }
        } catch (error) {
            errorFlag = error;
            break;
        }
    }
    if (errorFlag) {
        yield [false, errorFlag];
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
            let groupDetail = await getChat(airgramInstance, groupId);
            if (!groupDetail[0]) {
                fullGroupInfo.error = groupDetail[1];
                return [false, fullGroupInfo];
            }
            fullGroupInfo.supergroupId = groupDetail[1].type.supergroupId;
            fullGroupInfo.title = groupDetail[1].title;
            fullGroupInfo.canInviteUsers = groupDetail[1].permissions.canInviteUsers;
            return [true, fullGroupInfo];
        });
        return [true, groupsInfo];
    } catch (error) {
        return [false, error];
    }
}

async function addChatMembers(airgramInstance, to, userIds, maxAdds, forwardLimit = 0) {
    let addsCount = 0;
    let result = [];
    for (let userId of userIds) {
        try {
            let addMemberResult = await airgramInstance.api.addChatMember({ chatId: to, userId, forwardLimit });
            if (addMemberResult._ == "error" || addMemberResult.response._ == "error") {
                result.push({ _: false, userId, reason: addMemberResult.response })
            } else {
                result.push({ _: true, userId })
                addsCount++;
                if (addsCount >= maxAdds) break;
            }
        } catch (error) {
            result.push({ _: false, userId, reason: error })
        }
    }
    return result;
}

async function* transferMembers(airgramInstance, from, to, maxAdds) {
    let totalAddsCount = 0;
    let errorFlag;
    for await (let members of getSupergroupMembers(airgramInstance, from, 100, 1000)) {
        if (!members[0]) {
            errorFlag = members[1];
            break;
        }
        let userIds = members[1].map(member => member.memberId.userId);
        let addMembersResult = await addChatMembers(airgramInstance, to, userIds, maxAdds - totalAddsCount);
        let addsCount = addMembersResult.filter(result => result._).length;
        let failedAdds = addMembersResult.filter(result => !result._);
        totalAddsCount += addsCount;
        yield [true, { totalAddsCount, addsCount, failedAdds }];
        if (totalAddsCount >= maxAdds) break;
    }

    if (errorFlag) {
        yield [false, errorFlag];
    }
}

export { getChats, logOut, getGroups, transferMembers };
