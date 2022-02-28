import React, { useState, useEffect } from 'react';
import { usePrevProps } from '../../hooks/usePrevProps';
import styles from './Tile.module.scss';

type Props = {
  // tile value - 2, 4, 8, 16, 32, ..., 2048.
  value: number;
  // an array containing the x and y index on the board.
  position: [number, number];
  // the order of tile on the tile stack.
  zIndex: number;
}

const Tile = ({ value, position, zIndex }: Props) => {
  // retieves board properties
  //const [containerWidth, tileCount] = useBoard();
  //  state required to animate the highlight
  const [scale, setScale] = useState(1);

  // the previous value (prop) - it is undefined if it is a new tile.
  const previousValue = usePrevProps<number>(value);

  // if it is a new tile...
  const isNew = previousValue === undefined;
  // ...or its value has changed...
  const hasChanged = previousValue !== value;
  // ... then the tile should be highlighted.
  const shallHighlight = isNew || hasChanged;

  // useEffect will decide if highlight should be triggered.
  useEffect(() => {
    if (shallHighlight) {
      setScale(1.1);
      setTimeout(() => setScale(1), 100);
    }
  }, [shallHighlight, scale]);

  /**
   * Converts tile position from array index to pixels.
   */
  // const positionToPixels = (position: number) => {
  //   return (position / tileCount) * (containerWidth as number);
  // };

  // all animations come from CSS transition, and we pass them as styles
  const style = {
    // top: positionToPixels(position[1]),
    // left: positionToPixels(position[0]),
    transform: `scale(${scale})`,
    zIndex,
  };

  return (
    <div
      className={`${styles.tile} ${styles[`tile-${value}`]}`}
      style={style}
    >
      {value}
    </div>
  );
};

export default Tile;