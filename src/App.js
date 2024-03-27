import useWebSocket from 'react-use-websocket'
import './App.css';
import Room from "./pages/Index/Room"

import { message as messageCreate, FLAGS, isSet, CONSTS } from './Message';
import { useState } from 'react';
import { Naming } from './pages/Naming/Naming';

const messages = [];

const ws_url = 'ws://127.0.0.1:8000'

function App() {
  const [named, setNamed] = useState(false);
  const [username, setName] = useState('User');

  const [lastNamingError, setNamingError] = useState('');

  const { sendJsonMessage } = useWebSocket(ws_url, {
    onMessage: (event) => {
      const message = JSON.parse(event.data)
      if(isSet(message['flag'], CONSTS['SHOW'])) {
        messages.push(message)
      } else {
        switch(message['flag']['id']) {
          case FLAGS.log_finish.id: sendJsonMessage(JSON.stringify(messageCreate(FLAGS.join, username))); break;
          case FLAGS.name_failed.id: setNamingError('Name Already In Use'); break;
          case FLAGS.name_succeed.id: {
            setName(message['user']);
            setNamed(true);
            sendJsonMessage(JSON.stringify(messageCreate(FLAGS.log_request)));
            break;
          }
          default: console.error(`Unexpected flag id: ${message['flag']['id']}`);
        }
      }
    }
  })

  return (
    <div>
    {named ? <Room msgs={messages} username={username} sendJson={sendJsonMessage} />
    : <Naming namingError={lastNamingError} setNamingError={setNamingError} sendJson={sendJsonMessage} />}
    </div>
  )
}

export default App;
