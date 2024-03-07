import React, { useState } from "react"
import "./Index.css"
import { FLAGS, Message, message } from "../../Message";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";

type splitResult = { mentioned: boolean, result: (string | JSX.Element)[] }

export function Room({ msgs, username, sendJson }: { msgs: Array<Message>, username: string, sendJson: SendJsonMessage }) {
    const [inputText, setInputText] = useState('');
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

    function highlightMentions(msg: string): splitResult {
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
        var formatted = timestampToDateString(message['timestamp']);
        if (mention) {
            let messageResult = highlightMentions(message['msg']);
            return (
            <div className={`Message_body ${messageResult.mentioned ? "Mention_highlight" : ""}`} key={idx}>
                <span className="Username">{message['user']}</span><span className={messageResult.mentioned ? "Mention_timestamp" : "Timestamp"}>{formatted}</span>
                <p className="Message_text">{messageResult.result}</p>
            </div>
            )
        }
        return (
        <div className="Message_body" key={idx}>
            <span className="Username">{message['user']}</span><span className="Timestamp">{formatted}</span>
            <p className="Message_text">{message['msg']}</p>
        </div>
        )
    }

    function condenseElement(message: Message, mention: boolean, idx: number) {
        if (mention) {
            let messageResult: splitResult = highlightMentions(message['msg']);
            return (
            <div className={`Message_body ${messageResult.mentioned ? "Mention_highlight" : ""}`} key={idx}>
                <p className="Message_text">{messageResult.result}</p>
            </div>
            )
        }
        return (
        <div className="Message_body" key={idx}>
            <p className="Message_text">{message['msg']}</p>
        </div>
        )
    }

    function joinMessage(message: Message, idx: number) {
        var formatted = timestampToDateString(message['timestamp']);
        return <div className="Message_body" key={idx}>
            <span className="Green">{`${message['user']} has joined!`}</span><span className="Timestamp">{formatted}</span>
        </div>
    }

    function leaveMessage(message: Message, idx: number) {
        var formatted = timestampToDateString(message['timestamp']);
        return <div className="Message_body" key={idx}>
            <span className="Red">{`${message['user']} has left!`}</span><span className="Timestamp">{formatted}</span>
        </div>
    }

    function handleMessages(messages: Array<Message>) {
        let res = [];
        var prevUser: string | null = null;
        var prevStamp = 0;
        var headStamp = 0;
        for(let i = 0; i < messages.length; i++) {
            let message = messages[i];
            switch(message['flag']['id']) {
                case FLAGS.message['id']: {
                    var mention = message['msg'].includes(`@${username}`)
                    if(condenseMessage(message['uuid'], message['timestamp'], prevUser, headStamp, prevStamp)) {
                        res.push(condenseElement(message, mention, i));
                    }
                    else {
                        if (i !== 0) res.push(<hr key={messages.length + i}/>)
                        res.push(messageElement(message, mention, i));
                        headStamp = message['timestamp'];
                    }
                    prevUser = message['uuid']
                    prevStamp = message['timestamp']
                    break;
                }
                case FLAGS.join['id']: {
                    if (i !== 0) res.push(<hr key={messages.length + i}/>)
                    res.push(joinMessage(message, i));
                    prevUser = null;
                    break;
                }
                case FLAGS.leave['id']: {
                    if (i !== 0) res.push(<hr key={messages.length + i}/>)
                    res.push(leaveMessage(message, i));
                    prevUser = null;
                    break;
                }
                default: {
                    console.log(message['flag']['id'])
                    console.log(message)
                }
            }
        }
        return res;
    }

    function messageSend() {
        if(inputText !== '') {
            sendJson(JSON.stringify(message(FLAGS.message, username, inputText)));
            setInputText("");
        }
    }

    return (
    <div>
        <div id="messages">
            {handleMessages(msgs)}
        </div>
        <form onSubmit={(e) => {
            e.preventDefault()
            messageSend()
        }}>
            <input
                type="text"
                className="Text_input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter a Message"
            />
            <input type="submit" value="Send" className="Button_input"/>
        </form>
    </div>
    )
}

export default Room;