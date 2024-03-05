import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Room from "./pages/Index/Room"

import { Message, FLAGS } from './Message';

const messages = [new Message(FLAGS.message, 'User', 'Message')];
messages.push(new Message(FLAGS.message, 'User', '@User \nTest'));

const username = 'User';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/*" element={<Room msgs={messages} username={username} />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
