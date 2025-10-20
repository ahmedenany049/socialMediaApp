
import { userType } from "./user.type"
import userService from "../user.service"
import * as UserArgs from "./user.args"


class userFields {
    constructor(){}
    query =()=>{
        return {
            getOneUser:{
                type:userType,
                //args:UserArgs.getUserArgs,
                resolve:userService.getOneUser
            }
        }
    }
    mutation = ()=>{
        return {createUser:{
            type:userType,
            args:UserArgs.createUserArgs,
            resolve:userService.createUser
        }}
    }
}
export default new userFields()