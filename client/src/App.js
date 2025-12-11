import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoomProvider } from './context/RoomContext';
import Welcome from './pages/Welcome';
import RoomDashboard from './pages/RoomDashboard';
import './App.css';

function App() {
    return (
        <Router>
            <RoomProvider>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="/room/:code" element={<RoomDashboard />} />
                    </Routes>
                </div>
            </RoomProvider>
        </Router>
    );
}

export default App;
