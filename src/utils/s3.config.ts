import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {v4 as uuid}from"uuid"
import { storageEnum } from "../middleware/multer.cloud";
import {createReadStream}from "fs"
import { AppError } from "./classError";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export const s3Client = ()=>{
    return new S3Client({
        region:process.env.AWS_REGION!,
        credentials:{
            accessKeyId:process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!
        }
    })
}

//======================================================================
export const uploadFile = async(
    {
        storeType=storageEnum.cloud,
        Bucket=process.env.AWS_BUKET_NAME!,
        path="general",
        file,
        ACL="private"as ObjectCannedACL
    }:{
        storeType?:storageEnum
        Bucket?:string,
        ACL?:ObjectCannedACL,
        path:string,
        file:Express.Multer.File
    }
):Promise<string>=>{

    const command=new PutObjectCommand({
        Bucket,
        ACL,
        Key:`${process.env.APPLICATION_NAME}/${path}/${uuid()}_${file.originalname}`,
        Body:storeType===storageEnum.cloud? file.buffer:createReadStream(file.path),
        ContentType:file.mimetype
    })
    await s3Client().send(command)
    if(!command.input.Key){
        throw new AppError("failed to upload file",500)
    }
    return command.input.Key
}

//==================================================================
export const uploadLargeFile=async(
        {
        storeType=storageEnum.cloud,
        Bucket=process.env.AWS_BUKET_NAME!,
        path="general",
        file,
        ACL="private"as ObjectCannedACL
    }:{
        storeType?:storageEnum
        Bucket?:string,
        ACL?:ObjectCannedACL,
        path:string,
        file:Express.Multer.File
    }
)=>{
    const upload = new Upload({
        client:s3Client(),
        params:{
            Bucket,
            ACL,
            Key:`${process.env.APPLICATION_NAME}/${path}/${uuid()}_${file.originalname}`,
            Body:storeType===storageEnum.cloud? file.buffer:createReadStream(file.path),
            ContentType:file.mimetype
        }
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(progress);
    })
    const {Key} = await upload.done()
    if(!Key){
        throw new AppError("failed to upload file",500)
    }
    return Key
}

//=======================================================================
export const uploadFiles = async(
    {
        storeType=storageEnum.cloud,
        Bucket=process.env.AWS_BUKET_NAME!,
        path="general",
        files,
        ACL="private"as ObjectCannedACL,
        useLarge=false
    }:{
        storeType?:storageEnum
        Bucket?:string,
        ACL?:ObjectCannedACL,
        path:string,
        files:Express.Multer.File[],
        useLarge?:boolean
    })=>{
        let urls:string[]=[]
        if(useLarge==true){
            urls = await Promise.all(files.map (file=>uploadLargeFile({storeType,Bucket,path,ACL,file})))
        }else{
            urls = await Promise.all(files.map (file=>uploadFile({storeType,Bucket,path,ACL,file})))
        }
    return urls
}

//============================================================================
export const createUpliadFilePreSignUrl = async(
    {
        Bucket=process.env.AWS_BUKET_NAME!,
        path="general",
        originalname,
        ContentType,
        expiresIn=60*60
    }:{
        Bucket?:string,
        originalname:string,
        ContentType:string,
        path?:string,
        expiresIn?:number
    }
)=>{
    const command = new PutObjectCommand({
        Bucket,
        Key:`${process.env.APPLICATION_NAME}/${path}/${uuid()}_${originalname}`,
        ContentType
    })
    const utl = await getSignedUrl(s3Client(),command,{expiresIn})
}