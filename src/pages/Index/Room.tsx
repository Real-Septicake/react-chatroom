import React, { useState } from "react"
import "./Index.css"
import { FLAGS, Message } from "../../Message";

export function Room({ msgs, username }: { msgs: Array<Message>, username: string }) {
    const [inputText, setInputText] = useState('');
    const messageList = msgs;
    function timestampToDateString(stamp: number): string {
        var date: Date = new Date(stamp - new Date().getTimezoneOffset() * 60 * 1000);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours() < 10 ? '0' : ''}${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    }

    function condenseMessage(currentUser: string, currentStamp: number, previousUser: string | null, headStamp: number, previousStamp: number): boolean {
        return (
            currentUser === previousUser &&
            currentStamp - previousStamp < 60_000 &&
            currentStamp - headStamp < 180_000
        )
    }

    function highlightMentions(msg: string): { mentioned: boolean, result:(string | JSX.Element)[]} {
        let res = [];
        let pieces = msg.split(new RegExp(`(?<=\\s|^)@${username}(?=\\s|$)`));
        for(let i = 0; i < pieces.length; i++) {
            res.push(pieces[i])
            if(i !== pieces.length - 1) 
                res.push(<span className="Mention_text" key={pieces.length + i}>{`@${username}`}</span>)
        }
        return { mentioned: pieces.length !== 1, result: res};
    }

    function messageElement(message: Message, mention: boolean, idx: number) {
        var formatted = timestampToDateString(message.timestamp);
        if (mention) {
            let messageResult = highlightMentions(message.msg);
            return (
            <div className={`Message_body ${messageResult.mentioned ? "Mention_highlight" : ""}`} key={idx}>
                <span className="Username">{message.user}</span><span className="Timestamp">{formatted}</span>
                <p className="Message_text">{messageResult.result}</p>
            </div>
            )
        }
        return (
        <div className="Message_body" key={idx}>
            <span className="Username">{message.user}</span><span className="Timestamp">{formatted}</span>
            <p className="Message_text">{message.msg}</p>
        </div>
        )
    }

    function condenseElement(message: Message, mention: boolean, idx: number) {
        if (mention) {
            let messageResult = highlightMentions(message.msg);
            return (
            <div className={`Message_body ${messageResult.mentioned ? "Mention_highlight" : ""}`} key={idx}>
                <p className="Message_text">{messageResult.result}</p>
            </div>
            )
        }
        return (
        <div className="Message_body" key={idx}>
            <p className="Message_text">{message.msg}</p>
        </div>
        )
    }

    function joinMessage(message: Message, idx: number) {
        var formatted = timestampToDateString(message.timestamp);
        return <div className="Message_body" key={idx}>
            <span className="Green">{`${message.user} has joined!`}</span><span className="Timestamp">{formatted}</span>
        </div>
    }

    function leaveMessage(message: Message, idx: number) {
        var formatted = timestampToDateString(message.timestamp);
        return <div className="Message_body" key={idx}>
            <span className="Red">{`${message.user} has left!`}</span><span className="Timestamp">{formatted}</span>
        </div>
    }

    function handleMessages(messages: Array<Message>) {

        let res = [];
        var prevUser: string | null = null;
        var prevStamp = 0;
        var headStamp = 0
        for(let i = 0; i < messages.length; i++) {
            let message = messages[i];
            switch(message.flag) {
                case FLAGS.message: {
                    var mention = message.msg.includes(`@${username}`)
                    if(condenseMessage(message.user, message.timestamp, prevUser, headStamp, prevStamp)) {
                        res.push(condenseElement(message, mention, i));
                    }
                    else {
                        if (i !== 0) res.push(<hr key={message.timestamp + i}></hr>)
                        res.push(messageElement(message, mention, i));
                        headStamp = message.timestamp;
                    }
                    prevUser = message.user
                    prevStamp = message.timestamp
                    break;
                }
                case FLAGS.join: {
                    if (i !== 0) res.push(<hr key={message.timestamp + i}></hr>)
                    res.push(joinMessage(message, i));
                    break;
                }
                case FLAGS.leave: {
                    if (i !== 0) res.push(<hr key={message.timestamp + i}></hr>)
                    res.push(leaveMessage(message, i));
                    break;
                }
            }
        }
        return res;
    }

    function messageSend(evt: React.KeyboardEvent<HTMLInputElement>) {
        if(evt.shiftKey && evt.code === 'Enter' && inputText !== '') {
            messageList.push(new Message(FLAGS.join, inputText));
            setInputText("")
        } else
        if(evt.ctrlKey && evt.code === 'Enter' && inputText !== '') {
            messageList.push(new Message(FLAGS.leave, inputText));
            setInputText("")
        } else
        if(evt.code === 'Enter' && inputText !== '') {
            messageList.push(new Message(FLAGS.message, username, inputText))
            setInputText("");
        }
    }

    return (
    <div>
        <div id="messages">
            {handleMessages(msgs)}
        </div>
        <input
            type="text"
            className="Input"
            value={inputText}
            onKeyDown={messageSend}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter a Message"
        />
    </div>
    )
}

export default Room;