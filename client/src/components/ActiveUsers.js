import React from 'react';
import { useRoom } from '../context/RoomContext';
import './ActiveUsers.css';

const ActiveUsers = () => {
    const { users, host, currentUser } = useRoom();

    return (
        <div className="active-users">
            <h3>Active Users ({users.length})</h3>
            <div className="users-list">
                {users.map((user) => (
                    <div key={user.id} className="user-item">
                        <div className="user-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-name">
                                {user.name}
                                {user.id === currentUser && ' (You)'}
                            </span>
                            {user.id === host && (
                                <span className="host-badge">👑 Host</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveUsers;
