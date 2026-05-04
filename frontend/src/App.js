import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import LoginForm from './components/LoginForm';
import PollForm from './components/PollForm';
import PollCard from './components/PollCard';
import './App.css';

const socket = io('http://localhost:3001');

//fonction app
function App() {
  const [pseudo, setPseudo] = useState('');
  const [polls, setPolls] = useState([]);
  const [voted, setVoted] = useState({});       // { pollId: true }
  const [userCount, setUserCount] = useState(0); // Bonus 1

  useEffect(() => {
    socket.on('polls:update', (updatedPolls) => {
      setPolls(updatedPolls);
    });

    // Bonus 1 : écouter le compteur de participants
    socket.on('users:count', (count) => {
      setUserCount(count);
    });

    return () => {
      socket.off('polls:update');
      socket.off('users:count');
    };
  }, []);

  // --- Écran de connexion ---
  if (!pseudo) {
    return <LoginForm socket={socket} onJoin={setPseudo} />;
  }

  // --- Écran principal ---
  return (
      <div className="app">
        <header className="app-header">
          <h1>🗳️ PollBoard</h1>
          <p>Connecté en tant que <strong>{pseudo}</strong></p>
          {/* Bonus 1 */}
          <p className="user-count">👥 {userCount} participant(s) connecté(s)</p>
        </header>

        <PollForm socket={socket} />

        <div className="polls-list">
          {polls.length === 0 && <p className="no-polls">Aucun sondage pour le moment.</p>}
          {polls.map(poll => (
              <PollCard
                  key={poll.id}
                  poll={poll}
                  socket={socket}
                  hasVoted={!!voted[poll.id]}
                  onVote={() => setVoted(v => ({ ...v, [poll.id]: true }))}
              />
          ))}
        </div>
      </div>
  );
}

export default App;