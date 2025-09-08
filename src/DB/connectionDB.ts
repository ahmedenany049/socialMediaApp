import mongoose from "mongoose";

const connectionDB=async()=>{
    mongoose.connect(process.env.DB_URL as unknown as string)
    .then(()=>{
        console.log("success to connect db.........");
    }).catch((error)=>{
        console.log("fail to connect db......");
    })
}
export default connectionDB