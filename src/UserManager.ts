import { WebSocket } from "ws";
import { User } from "./User";
import crypto from "crypto";
export class UserManager {
    private static instance: UserManager;

    private users: Map<string, User> = new Map();
    private chats: Map<string, Set<User>> = new Map(); 
    private constructor(){

    }

    public static getInstance() {
        if(!this.instance){
            this.instance = new UserManager();
        }

        return this.instance;
    }

    public addUser(ws: WebSocket){
        const id = crypto.randomUUID();
        const user = new User(id,ws);
        this.users.set(id, user)
        console.log(`User added with ID: ${id}`)
    }
    public addUserToChat(chatId: string, user: User){
        if(!this.chats.has(chatId)){
            this.chats.set(chatId, new Set());
        }
        const chatUsers = this.chats.get(chatId);
        chatUsers?.add(user);
        console.log(`User ${user.getUserId()} added to chat ${chatId}`)
    }
    public sendToChat(userId: string, chatId: string, message: string){
        const chatUsers = this.chats.get(chatId);

        if(!chatUsers){
            console.error(`Chat with ID ${chatId} does not exist.`);
            return
        }

        const sender = this.users.get(userId);
        if(!sender){
            console.log(`User with ID ${userId} does not exist.`);
            return
        }

        for(const user of chatUsers){
            if(user.getUserId() !== userId){
                user.send(message)
            }
        }
        console.log(`Message sent from user ${userId} to chat ${chatId}: ${message}`);
    }
}