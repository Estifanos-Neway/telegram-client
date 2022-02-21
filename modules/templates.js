
//api methods
async function aFunction(airgramInstance){
    try {
        let result = await airgramInstance.api.someAirgramMethod();
        if(result._ == "error" || result.response._ == "error"){
            return [false, result];
        }
        return [true, result];
    } catch (error) {
        return [false, error]
    }
}