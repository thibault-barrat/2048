import React, { useState } from "react";
import styles from "./App.module.scss";
import Button from "./components/Button";
import Game from "./components/Game";

function App() {
  const [date, setDate] = useState<Date>(new Date());

  const handleRestart = () => {
    setDate(new Date());
  };

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div>
          <h1>Play 2048</h1>
        </div>
        <div>
          <Button onClick={handleRestart}>Restart</Button>
        </div>
      </div>
      <Game key={date.toISOString()} />
      <div>
        <p>
          This game has been built using <b>React</b> and <b>TypeScript</b> with the great tutorial from{" "}
          <a
            href="https://www.youtube.com/channel/UCJV16_5c4A0amyBZSI4yP6A"
            target="_blank" rel="noreferrer"
          >
            Matt Sokola
          </a>
        </p>
        <ul>
          <li>
            <a href="https://youtu.be/vI0QArPnkUc" target="_blank" rel="noreferrer">
              Tutorial (YouTube video)
            </a>
          </li>
          <li>
            <a
              href="https://github.com/mateuszsokola/2048-in-react/"
              target="_blank" rel="noreferrer"
            >
              Source Code (Github)
            </a>
          </li>
          <li>
            <a
              href="https://mateuszsokola.github.io/2048-animation-examples/"
              target="_blank" rel="noreferrer"
            >
              Animation Examples (Github Pages)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
