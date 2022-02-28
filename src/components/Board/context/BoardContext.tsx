import React from 'react';
import { defaultTileCount } from "../models/Board";

export const BoardContext = React.createContext({
  containerWidth: 0,
  tileCount: defaultTileCount,
});

type Props = {
  containerWidth: number;
  tileCount: number;
  children: React.ReactNode;
}

export const BoardProvider = ({ containerWidth = 0, tileCount = defaultTileCount, children }: Props) => {
  return (
    <BoardContext.Provider value={{ containerWidth, tileCount }}>
      {children}
    </BoardContext.Provider>
  );
};