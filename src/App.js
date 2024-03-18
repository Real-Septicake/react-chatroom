import useWebSocket from 'react-use-websocket'
import './App.css';
import Room from "./pages/Index/Room"

import { message as messageCreate, FLAGS } from './Message';
import React, { useState } from 'react';
import { Naming } from './pages/Index/Naming';

const messages = [];

const ws_url = 'ws://127.0.0.1:8000'

function App() {
  const [named, setNamed] = useState(false);
  const [username, setName] = useState('User');

  const [lastNamingError, setNamingError] = useState('');

  const { sendJsonMessage } = useWebSocket(ws_url, {
    onMessage: (event) => {
      const message = JSON.parse(event.data)
      console.log(message)
      if(message['flag']['show']) {
        messages.push(message)
      } else {
        switch(message['flag']['id']) {
          case FLAGS.log_finish.id: sendJsonMessage(JSON.stringify(messageCreate(FLAGS.join, username))); break;
          case FLAGS.name_failed.id: setNamingError('Name Already In Use'); break;
          case FLAGS.name_succeed.id: {
            setName(message['user'])
            setNamed(true)
            sendJsonMessage(JSON.stringify(messageCreate(FLAGS.log_request)))
            console.log('success')
          }
        }
      }
    }
  })

  return (
    <div>
    {named ? <Room msgs={messages} username={username} sendJson={sendJsonMessage} />
    : <Naming namingError={lastNamingError} setNamingError={setNamingError} sendJson={sendJsonMessage} />}
    {/* : <Room msgs={messages} username={username} sendJson={sendJsonMessage} /> } */}
    </div>
  )
}

export default App;
