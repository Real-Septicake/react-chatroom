import useWebSocket from 'react-use-websocket'
import './App.css';
import Room from "./pages/Index/Room"

import { message as messageCreate, FLAGS } from './Message';
import { useState } from 'react';

const messages = [messageCreate(FLAGS.message, 'User', 'Message')];
messages.push(messageCreate(FLAGS.message, 'User', '@User \nTest'));

// const username = 'User';

const ws_url = 'ws://127.0.0.1:8000'

function App() {
  const [named, setNamed] = useState(false)
  const [username, setName] = useState('User')

  const { sendJsonMessage } = useWebSocket(ws_url, {
    onOpen: () => {
      sendJsonMessage(JSON.stringify(messageCreate(FLAGS.log_request)))
    },
    onMessage: (event) => {
      try{
        const message = JSON.parse(event.data)
        if(message['flag']['show']) {
          messages.push(message)
        } else {
          switch(message['flag']['id']) {
            case FLAGS.log_finish.id: sendJsonMessage(JSON.stringify(messageCreate(FLAGS.join, username)))
          }
        }
      } catch {
        console.log(JSON.parse(event.data))
      }
    }
  })

  return (
    <div>
    {named ? <Room msgs={messages} username={username} sendJson={sendJsonMessage} />
    : <Room msgs={messages} username={username} sendJson={sendJsonMessage} />}
    </div>
  )

  // return (
  //   <Router>
  //     <div>
  //       <Routes>
  //         <Route path="/*" element={<Room msgs={messages} username={username} sendJson={sendJsonMessage} />}/>
  //       </Routes>
  //     </div>
  //   </Router>
  // );
}

export default App;
