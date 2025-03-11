import {getLocalData, getTokenData} from "./dataOperation.ts";
import axios from "axios";
import {getAddress} from "./address.ts";

export async function getLowCodeToken(type,set) {
    try {
        set.id = getLocalData("id");
        set.token = await getTokenData();
        console.log(set);
        const response = await axios.post(getAddress() + "/low_code/"+type, set);
        if (response.data.response === "success") {
            return response.data.id;
        } else if (response.data.response === "quota_low") {
            return "quota_low";
        } else return "err"+response.data.response;
    } catch (error) {
        console.error(error)
        return "err"
    }
}