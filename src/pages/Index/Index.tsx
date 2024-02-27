import React from "react"
import "./Index.css"
import { Message } from "../../Message";

function Index(msgs: Array<Message>) {
    function messageElement(message: Message) {
        var date: Date = new Date(message.timestamp - new Date().getTimezoneOffset() * 60 * 1000);
        var formatted: string = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
        return <div className="Message_body">
            <span className="Username">{message.user}</span><span className="Timestamp">{formatted}</span>
            <p className="Message_text">{message.msg}</p>
        </div>
    }

    return <div>
        {msgs.map(msg => (messageElement(msg)))}
    </div>
}

export default Index;