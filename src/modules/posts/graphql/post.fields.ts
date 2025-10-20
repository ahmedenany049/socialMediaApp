import { GraphQLList } from "graphql"
import { postType } from "./post.types"
import postService from "../post.service"
import { likePostArgs } from "./post.args"



class postFields {
    constructor(){}
    query =()=>{
        return {
            getPosts:{
                type:new GraphQLList(postType),
                resolve:postService.getPostsGQL
            }
        }
    }
    mutation = ()=>{
        return {createUser:{
            type:postType,
            args:likePostArgs,
            resolve:postService.likePostQL
        }}
    }
}
export default new postFields()