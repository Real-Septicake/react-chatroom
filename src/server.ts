import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { v4 as uuidv4} from "uuid"
import { FLAGS, Message, message as messageCreate } from "./Message";

enum ConnectionState {
    naming,
    receiving_log,
    ready
}

const server = http.createServer();
const wsServer = new WebSocketServer({ server });

const port = 8000;
const connections: Record<string, WebSocket> = {};
const users: Record<string, ConnectionState> = {};
const usernames: Record<string, string> = {};

const log: Array<Message> = [];

const broadcast = async (message: Message) => {
    Object.keys(connections).forEach((uuid: string) => {
        if(users[uuid] === ConnectionState.ready) {
            const connection = connections[uuid];
            connection.send(JSON.stringify(message));
        }
    });
}

const handleMessage = (data: string, uuid: string) => {
    const message: Message = JSON.parse(JSON.parse(data.toString()));
    if(message.flag.special) {
        let connection = connections[uuid];
        switch(message.flag.id) {
            case FLAGS.log_request.id: {
                for(let msg of log) {
                    connection.send(JSON.stringify(msg));
                }
                connection.send(JSON.stringify(messageCreate(FLAGS.log_finish)));
                break;
            }
            case FLAGS.name_check.id: {
                let names = Object.keys(usernames).map((uuid: string) => {
                    return usernames[uuid];
                })
                if(message.user in names)
                    connection.send(JSON.stringify(messageCreate(FLAGS.name_failed)));
                else
                    usernames[uuid] = message.user;
                    connection.send(JSON.stringify(messageCreate(FLAGS.name_succeed)));
            }
        }
    } else {
        if(message.flag.log) log.push(message);
        broadcast(message);
    }
}

const userLeave = (uuid: string) => {
    delete connections[uuid];
    delete users[uuid];
    broadcast(messageCreate(FLAGS.leave, usernames[uuid]));
    delete usernames[uuid];
}

wsServer.on('connection', (connection: WebSocket) => {
    const uuid: string = uuidv4();
    connections[uuid] = connection;
    users[uuid] = ConnectionState.ready;
    usernames[uuid] = '[[Unnamed User]]';

    console.log(`New Connection: ${uuid}`)

    connection.on('message', (message: string) => handleMessage(message, uuid));    
    connection.on('close', () => {
        console.log(`User left: ${uuid}`);
        userLeave(uuid);
    });
})

server.listen(port, () => {console.log(`Server running on port ${port}`)});