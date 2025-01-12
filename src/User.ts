import { WebSocket } from "ws";
import { UserManager } from "./UserManager";

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
            const parsedData = JSON.parse(data as unknown as string);
            if(parsedData.type === "SUBSCRIBE"){
                UserManager.getInstance().addUserToChat(parsedData.chatId, this)
            }
            if(parsedData.type === "sendMessage"){
                UserManager.getInstance().sendToChat(this.id, parsedData.chatId, parsedData.message);
            }
        })
    }
}