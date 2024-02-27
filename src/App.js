import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Index from "./pages/Index/Index"

import { Message, FLAGS } from './Message';

const messages = [new Message(FLAGS.message, 'User', 'Message')];

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/*" element={Index(messages)}/>
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;
