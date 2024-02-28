import React from "react"
import "./Index.css"
import { FLAGS, Message } from "../../Message";

function Index(msgs: Array<Message>, username: string) {
    function timestampToDateString(stamp: number): string {
        var date: Date = new Date(stamp - new Date().getTimezoneOffset() * 60 * 1000);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours() < 10 ? '0' : ''}${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    }

    function highlightMentions(msg: string) {
        let res = [];
        let pieces = msg.split(new RegExp(`(?<=\\s|^)@${username}(?=\\s|$)`));
        for(let i = 0; i < pieces.length; i++) {
            res.push(pieces[i])
            if(i !== pieces.length - 1) 
                res.push(<span className="Mention_text">{`@${username}`}</span>)
        }
        return res;
    }

    function messageElement(message: Message, mention: boolean) {
        var formatted = timestampToDateString(message.timestamp);
        return <div className={`Message_body ${mention ? "Mention_highlight" : ""}`}>
            <span className="Username">{message.user}</span><span className="Timestamp">{formatted}</span>
            <p className="Message_text">{mention ? highlightMentions(message.msg) : message.msg}</p>
        </div>
    }

    function joinMessage(message: Message) {
        var formatted = timestampToDateString(message.timestamp);
        return <div className="Message_body">
            <span className="Green">{`${username} has joined!`}</span><span className="Timestamp">{formatted}</span>
        </div>
    }

    function leaveMessage(message: Message) {
        var formatted = timestampToDateString(message.timestamp);
        return <div className="Message_body">
            <span className="Red">{`${username} has left!`}</span><span className="Timestamp">{formatted}</span>
        </div>
    }

    function handleMessages(messages: Array<Message>) {
        let res = [];
        for(let i = 0; i < messages.length; i++) {
            let message = messages[i];
            switch(message.flag) {
                case FLAGS.message: {
                    res.push(messageElement(message, message.msg.includes(`@${username}`)));
                    break;
                }
                case FLAGS.join: {
                    res.push(joinMessage(message));
                    break;
                }
                case FLAGS.leave: {
                    res.push(leaveMessage(message));
                    break;
                }
            }
            if(i !== messages.length - 1)
                res.push(<hr></hr>)
        }
        return res;
    }

    return <div>
        {handleMessages(msgs)}
    </div>
}

export default Index;