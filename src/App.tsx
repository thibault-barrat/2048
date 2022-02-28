import React from 'react';
import styles from './App.module.scss';
import Tile from './components/Tile';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
       2048
      </header>
      <Tile value={4} position={[0, 0]} zIndex={0}/>
    </div>
  );
}

export default App;
