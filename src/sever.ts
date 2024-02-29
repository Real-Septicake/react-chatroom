import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { v4 as uuidv4} from "uuid"
import { FLAGS, Message } from "./Message";

enum ConnectionState {
    naming,
    receiving_log,
    ready
}

const server = http.createServer();
const wsServer = new WebSocketServer({ server });

const port = 8800;
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

const handleMessage = (data: string) => {
    const message: Message = JSON.parse(data.toString());
    log.push(message);
    broadcast(message);
}

const userLeave = (uuid: string) => {
    delete connections[uuid];
    delete users[uuid];
    broadcast(new Message(FLAGS.leave, usernames[uuid]));
    delete usernames[uuid];
}

wsServer.on('connection', (connection: WebSocket) => {
    const uuid: string = uuidv4();
    connections[uuid] = connection;
    users[uuid] = ConnectionState.naming;
    usernames[uuid] = '[[Unnamed User]]';

    connection.on('message', (message: string) => handleMessage(message));    
    connection.on('close', () => userLeave(uuid));
})