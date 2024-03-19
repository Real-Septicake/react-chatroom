import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { v4 as uuidv4} from "uuid"
import { FLAGS, Message, message as messageCreate } from "./Message";

enum ConnectionState {
    naming,
    receiving_log,
    ready,
    intermediate,
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
    var message = JSON.parse(data.toString());
    if(typeof message === "string") {
        message = JSON.parse(message)
    }
    if(message['flag']['special']) {
        let connection = connections[uuid];
        switch(message['flag']['id']) {
            case FLAGS.log_request.id: {
                users[uuid] = ConnectionState.receiving_log
                for(let msg of log) {
                    connection.send(JSON.stringify(msg));
                }
                connection.send(JSON.stringify(messageCreate(FLAGS.log_finish)));
                users[uuid] = ConnectionState.intermediate
                break;
            }
            case FLAGS.name_check.id: {
                let names = Object.values(usernames)
                if(names.includes(message['user'])) {
                    connection.send(JSON.stringify(messageCreate(FLAGS.name_failed)));
                } else {
                    usernames[uuid] = message['user'];
                    users[uuid] = ConnectionState.intermediate
                    connection.send(JSON.stringify(messageCreate(FLAGS.name_succeed, message['user'])));
                }
            }
        }
    } else {
        if(message.flag.id === FLAGS.join.id) users[uuid] = ConnectionState.ready
        message['uuid'] = uuid;
        if(message.flag.log) log.push(message);
        broadcast(message);
    }
}

const userLeave = (uuid: string) => {
    delete connections[uuid];
    delete users[uuid];
    const leave: Message = messageCreate(FLAGS.leave, usernames[uuid]);
    broadcast(leave);
    delete usernames[uuid];
    log.push(leave);
}

wsServer.on('connection', (connection: WebSocket) => {
    const uuid: string = uuidv4();
    connections[uuid] = connection;
    users[uuid] = ConnectionState.naming;
    usernames[uuid] = '[[Unnamed User]]';

    console.log(`New Connection: ${uuid}`)

    connection.on('message', (message: string) => handleMessage(message, uuid));    
    connection.on('close', () => {
        console.log(`User left: ${uuid}`);
        userLeave(uuid);
    });
})

server.listen(port, () => {console.log(`Server running on port ${port}`)});