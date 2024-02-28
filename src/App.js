import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Index from "./pages/Index/Index"

import { Message, FLAGS } from './Message';

const messages = [new Message(FLAGS.message, 'User', 'Message')];
messages.push(new Message(FLAGS.message, 'User', '@User'))
messages.push(new Message(FLAGS.join, 'Username'))
messages.push(new Message(FLAGS.leave, 'Username'))

const username = 'User'

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/*" element={Index(messages, username)}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
