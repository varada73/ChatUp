import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Friendship from '../models/Friendship.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import {connectDB} from './db.js';

async function resetDatabase(){
    try{
        await connectDB();
        await Message.deleteMany({});
        await Conversation.deleteMany({});
        await Friendship.deleteMany({});
        await User.deleteMany({});
        mongoose.disconnect();


    }
    catch(err){
        console.error("Error resetting database:",err);
        await mongoose.disconnect();
    }
}
async function seed(){
    try{
       
        await resetDatabase();
        await connectDB();
        

        const userData=[
            {
                fullName: 'John',
                username: 'john',
                email: 'test@test.com',
                connectCode: "111111",


            },
            {
                fullName: 'Bob',
                username: 'bob',
                email: 'bob@test.com',
                connectCode: "222222"
            }
        ];
        const users= [];

        const hashPassword = await bcrypt.hash("password",10);
        for(const data of userData){
            data.password= hashPassword;
            const user = await User.create(data);
            console.log(`User created ${user.fullName}(${user.id})`);
            users.push(user);
        }
        const [user1, user2] = users;
        const friendship = await Friendship.create({
            requester: user1._id,
            recipient: user2._id,
        });
        console.log(`Friendship created: ${friendship.id}`);

        const conversation  = await Conversation.create({
            participants:[user1._id,user2._id],
            lastMessagePreview:null,
            unreadCount:{
                [user1._id]: 0,
                [user2._id]: 0,
            }
            
        });
        console.log(`Conversation created: ${conversation.id}`);
        const message = await Message.create({
            sender: user1._id,
            content: 'Hey Bob, welcome to the chat',
            conversation: conversation._id,


        });
        conversation.unreadCount.set(user2._id.toString(),1);
        conversation.unreadCount.set(user1._id.toString(),0);
        await conversation.save();
        console.log(`Message created: ${message._id}`);
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");

    }
    catch(err){
        console.error("Error seeding database:",err);
        await mongoose.disconnect();
    }
}
seed();