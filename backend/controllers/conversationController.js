import Conversation from '../models/Conversation.js';
import Friendship from '../models/Friendship.js';

import User from '../models/User.js';
import redisService from '../services/redisService.js';

class ConversationController{
    static async checkConnectCode(req,res){
        try{
           
            const userId = req.user._id;
            const {connectCode}= req.query;
            
            const friend = await User.findOne({connectCode});
            if(!friend|| friend._id.toString()==userId.toString()){
                return res.status(400).json({message:"Invalid connect code"})
            }
            const existingFriendship = await Friendship.findOne({
                $or:[
                    {requester:userId, recipient: friend._id},
                    {requester: friend._id, recipient: userId},
                ],
            })
            if(existingFriendship){
                return res.status(400).json({message:"Freindship already exists"});
            }
            console.log("Connect codde is valid");
            res.json({
                success: true,
                message: "Connect code is valid",
            });

        }
        catch(err){
            console.log("Error checking connect code",err);
            res.status(500).json({message:"Internal server error"});

        }
    }
    static async getConversations(req,res){
        try{
            const userId=req.user._id;
            const friendships = await Friendship.find({
                $or:[
                    {requester:userId},
                    {recipient: userId},
                ]
            }).populate([
                {path:'requester', select:'id fullName username connectCode'},
                {path:'recipient', select:'id fullName username connectCode'},
            ]).lean();
            if(!friendships.length){
                return res.json({data:[]});
            }
           const friendIds = friendships.map((friend)=>
        friend.requester._id.toString()==userId.toString()?friend.recipient._id.toString():friend.requester._id.toString()
        );
        const conversations = await Conversation.find({
            participants:{
                $all:[userId],
                $in: friendIds,
                $size: 2,
            }
        })
        const conversationMap = new Map();
        conversations.forEach((conversation)=>{
            const friendId = conversation.participants.find(p=>p.toString()!==userId.toString());
       conversationMap.set(friendId._id.toString(),conversation);


        })

        const conversationData = await Promise.all([
            ...friendships.map(async(friendship)=>{
                const isRequester= friendship.requester._id.toString()==userId.toString();
                const friend = isRequester? friendship.recipient: friendship.requester;
                const conversation = conversationMap.get(friend._id.toString());
                if(!conversation) return null;''
                return {
                    conversationId: conversation.id,
                    lastMessage: conversation.lastMessagePreview || null,
                    unreadCounts: {
                        [friendship.requester._id.toString()]: conversation.unreadCount.get(friendship.requester._id.toString()) || 0,
                        [friendship.recipient._id.toString()]:  conversation.unreadCount.get(friendship.recipient._id.toString()) || 0,
                    },
                    friend:{
                        id: friend._id.toString(),
                        username: friend.username,
                        fullName: friend.fullName,
                        connectCode: friend.connectCode,
                        online: await redisService.isUserOnline(friend._id.toString()),
                    }
                }

            })
        ])
        res.json({data: conversationData});



        }
        catch(err){
            console.log("Error fetching converstatons",err);
            res.status(500).json({message:"Internal server Error"});
        }
    }
    
}
export default ConversationController;