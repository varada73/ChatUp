import {createClient} from "redis";

class RedisService{
    constructor(){
        this.client=null;
    }
    async initialize(){
        if(this.client)return;

        try{
            this.client = createClient({
                url: process.env.REDIS_URI,

            })
            this.client.on("error",(error)=>console.error("Redis Client Error",error));
            await this.client.connect();
            console.log("Redis Connected!");

        }
        catch(err){
            console.error("Failed to initialize redis",err);
        }
    }
    async disconnect(){
        if(this.client){
            await thhis.client.quit();
            this.client=null;
            console.log("Redis disconnected!");
        }

    }
    async _safe(action, fallback=null){
        if(!this.client){
            await this.initialize();
            if(!this.client)return fallback;
        }
        try{
            return await action();

        }
        catch(error){
            console.error("Redis error",error);
            return fallback;
        }
    }
    async addUserSession(userId, socketId){
        await this._safe(async ()=>{
            const key = `user:${userId}:sessions`;
            await this.client.sAdd(key, socketId);
            await this.client.expire(key,600);
        })
    }
    async getUserSessionCount(userId){
        return await this._safe(async()=>{
           return this.client.sCard(`user:${userId}:sessions`);

        },0)
    }
    async removeUserSession(userId, socketId){
        await this._safe(async()=>{
           const key = `user:${userId}:sessions`;
           await this.client.sRem(key,socketId);
           const remaining= await this.getUserSessionCount(userId);
           if(remaining==0){
            await this.client.del(key);
           }
        })
    }
    async removeAllUserSessions(userId){
        await this._safe(async()=>{
            await this.client.del(`user:${userId}:sessions`);

        })
    }
    async isUserOnline(userId){
        const count= await this.getUserSessionCount(userId);
        return count>0;
    }
}
export default new RedisService;