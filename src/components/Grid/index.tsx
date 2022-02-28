import React from 'react';
import { useBoard } from '../Board/hooks/useBoard';
import styles from './Grid.module.scss';

const Grid = () => {
  const [, tileCount] = useBoard();

  const renderGrid = () => {
    const length = tileCount * tileCount;
    const cells = [] as JSX.Element[];

    for (let index = 0; index < length; index++) {
      cells.push(<div key={`cell-${index}`} className={styles.cell} />);
    }
    return cells;
  };

  return (
    <div className={styles.grid}>{renderGrid()}</div>
  )
}

export default Grid;