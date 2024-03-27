import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { message as messageCreate, FLAGS } from "../../Message";

import './Naming.css'
import { useState } from "react";

const valid_name = /\w/

export function Naming({ namingError, setNamingError, sendJson }: { namingError: string, setNamingError: React.Dispatch<React.SetStateAction<string>>, sendJson: SendJsonMessage }) {
    const [name, setName] = useState('')
    
    function validateName() {
        if(name.match(valid_name)) {
            sendJson(messageCreate(FLAGS.name_check, name))
        } else {
            setNamingError('Invalid Username.')
        }
    }
    
    return (
        <div className="Naming">
            <h2 className="Error">{namingError}</h2>
            <form onSubmit={(e) => {
                e.preventDefault()
                validateName();
            }} className="Submit">
                <input
                type="text"
                value={name}
                className="Name_input"
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a Name"
                />
                <input type="submit" value="Submit" className="Button_submit"/>
            </form>
        </div>
    )
}