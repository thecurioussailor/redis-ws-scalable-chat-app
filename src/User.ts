import { WebSocket } from "ws";
import { ChatManager } from "./ChatManager";

export class User {
    constructor( private id: string, private ws: WebSocket){
        this.addListners();
    }

    send(message: string){
        this.ws.send(message)
    }
    getUserId (){
        return this.id;
    }
    private addListners(){
        this.ws.on('message', (data: string) => {
            try{
                const parsedData = JSON.parse(data);
                if(parsedData.type === 'SUBSCRIBE'){
                    const chatId = parsedData.chatId;
                    ChatManager.getInstance().addUserToChat(chatId, this)
                }
                if(parsedData.type === 'sendMessage'){
                    const { chatId, message} = parsedData;
                    ChatManager.getInstance().sendMessageToChat(this.id, chatId, message);
                }
            }catch(error){
                console.log(`Failed to process user messages:`, error);
            }
        
        });
    }
}