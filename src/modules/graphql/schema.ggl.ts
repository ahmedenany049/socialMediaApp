import { GraphQLObjectType, GraphQLSchema } from "graphql"
import userFields from "../users/graphql/user.fields"
import postFields from "../posts/graphql/post.fields"


export const schemaGQL = new GraphQLSchema({
        query:new GraphQLObjectType({
            name:"Query",
            fields:{
                ...userFields.query(),
                ...postFields.query()
            }
        }),
        mutation:new GraphQLObjectType({
            name:"mutation",
            fields:{
                ...userFields.mutation()
            }
        })
    })