import useWebSocket from 'react-use-websocket'
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Room from "./pages/Index/Room"

import { message as messageCreate, FLAGS } from './Message';

const messages = [messageCreate(FLAGS.message, 'User', 'Message')];
messages.push(messageCreate(FLAGS.message, 'User', '@User \nTest'));

const username = 'User';

const ws_url = 'ws://127.0.0.1:8000'

function App() {
  const { sendJsonMessage } = useWebSocket(ws_url, {
    onOpen: () => {
      sendJsonMessage(JSON.stringify(messageCreate(FLAGS.join, username)))
    },
    onMessage: (event) => {
      try{
        const message = JSON.parse(event.data)
        if(message['flag']['show']) {
          messages.push(message)
        } else {
          console.log(message)
          console.log(typeof message)
        }
      } catch {
        console.log(JSON.parse(event.data))
      }
    }
  })

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/*" element={<Room msgs={messages} username={username} sendJson={sendJsonMessage} />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
