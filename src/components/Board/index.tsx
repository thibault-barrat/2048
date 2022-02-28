import React from 'react';
import { TileMeta, tileTotalWidth } from '../Tile/models/Tile';
import { boardMargin, defaultTileCount } from './models/Board';
import Tile from '../Tile';
import styles from './Board.module.scss';

type Props = {
  tiles: TileMeta[];
  tileCountPerRow: number;
}

const Board = ({ tiles, tileCountPerRow = defaultTileCount }: Props) => {
  // container width = tile width * tile count per row
  const containerWidth = tileTotalWidth * tileCountPerRow;
  // board width = container width + margin
  const boardWidth = containerWidth + boardMargin;

  // render all tiles on the board
  const tileList = tiles.map(({id, ...restProps}) => {
    <Tile key={`tile-${id}`} {...restProps} zIndex={id} />
  });

  return (
    <div className={styles.board} style={{ width: boardWidth }}>
      <div className={styles['tile-container']}>
        {tileList}
      </div>
    </div>
  )
}

export default Board