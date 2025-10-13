
const clintIo = io("http://localhost:3000",{
    auth:{
        authorization:"bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTQwZThkYjRmMmEzYTdlZTIzMzAzZiIsImVtYWlsIjoiYWhtZWRzYW15MjQ2OEBnbWFpbC5jb20iLCJpYXQiOjE3NjAzMDU5MjMsImV4cCI6MTc2MDMwOTUyMywianRpIjoiZWQ5NjQ5NmEtZGU3MC00NTBlLWI0MDUtMmE1ZjVmMjlkOWRmIn0.-FQFL7B--U8ndz1OkDZqZ7iVWMpsebWPeKx3Vq-o1UE"
    }
})

clintIo.on("sayHi",{message:"hello from FE"},(data)=>{
    console.log(data);
    
})
clintIo.on("connect",()=>{
    console.log("client connected");
    
})
clintIo.on("connect_error",(error)=>{
    console.log({error:error.message});
    
})
clintIo.on("userdisconnected",(data)=>{
    console.log({data});
    
})