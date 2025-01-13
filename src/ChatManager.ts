import { User } from "./User";
import { createClient, RedisClientType } from "redis"
export class ChatManager {

    private static instance: ChatManager;
    private subscriptions: Map<string, Set<User>> = new Map();
    private subscriber: RedisClientType
    private publisher: RedisClientType
    private constructor(){
        this.subscriber = createClient({
            url: "redis://localhost:6379"
        })
        this.subscriber.connect();
        this.publisher = createClient({
            url: "redis://localhost:6379"
        })
        this.publisher.connect();
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new ChatManager();
        }

        return this.instance;
    }

    public addUserToChat(chatId: string, user: User){
        if(!this.subscriptions.get(chatId)){
            this.subscriptions.set(chatId, new Set());
            this.subscribeToRedis(chatId);
        }
        this.subscriptions.get(chatId)?.add(user);
        console.log(`User ${user.getUserId()} added to chat ${chatId}`)
    }
    public subscribeToRedis(chatId: string){
        this.subscriber.subscribe(chatId, (data) => {
            const parsedData = JSON.parse(data);
            const chatUsers = this.subscriptions.get(chatId);

            if(chatUsers) {
                for (const user of chatUsers){
                    if(user.getUserId() !== parsedData.senderId){
                        user.send(parsedData.message)
                    }
                }
            }
        })
        console.log(`Subscribed to Redis channel for the chat ${chatId}`)
    }

    public sendMessageToChat(senderId: string, chatId: string, message: string){
        const payload = JSON.stringify({
            senderId,
            chatId,
            message
        });

        this.publisher.publish(chatId, payload);
        console.log(`Message published to chat ${chatId}: ${message}`);
    }

}