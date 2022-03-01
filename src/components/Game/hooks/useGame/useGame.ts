import { useRef, useReducer, useCallback, useEffect } from "react";
import { useIds } from "../useIds";
import { GameReducer, initialState } from "./reducer";
import { TileMeta } from "../../../Tile/models/Tile";
import {
  animationDuration,
  defaultTileCount,
} from "../../../Board/models/Board";

export const useGame = () => {
  const isInitialRender = useRef(true);
  const [nextId] = useIds();
  // state
  const [state, dispatch] = useReducer(GameReducer, initialState);
  const { tiles, inMotion, hasChanged, byIds } = state;

  const createTile = useCallback(
    ({ position, value }: Partial<TileMeta>) => {
      const id = nextId();
      const tile = {
        id,
        position,
        value,
      } as TileMeta;
      dispatch({ type: "CREATE_TILE", tile });
    },
    [nextId]
  );

  const mergeTile = (source: TileMeta, destination: TileMeta) => {
    dispatch({ type: "MERGE_TILE", source, destination });
  };

  // A must-have to keep the sliding animation if the action merges tiles together.
  const throttledMergeTile = (source: TileMeta, destination: TileMeta) => {
    setTimeout(() => mergeTile(source, destination), animationDuration);
  };

  const updateTile = (tile: TileMeta) => {
    dispatch({ type: "UPDATE_TILE", tile });
  };

  const didTileMove = (source: TileMeta, destination: TileMeta) => {
    const hasXChanged = source.position[0] !== destination.position[0];
    const hasYChanged = source.position[1] !== destination.position[1];
    return hasXChanged || hasYChanged;
  };

  const retrieveTileMap = useCallback(() => {
    const tileMap = new Array(defaultTileCount * defaultTileCount).fill(
      0
    ) as number[];

    byIds.forEach((id) => {
      const { position } = tiles[id];
      const index = positionToIndex(position);
      tileMap[index] = id;
    });

    return tileMap;
  }, [byIds, tiles]);

  const findEmptyTiles = useCallback(() => {
    const tileMap = retrieveTileMap();

    const emptyTiles = tileMap.reduce((result, tileId, index) => {
      if (tileId === 0) {
        return [...result, indexToPosition(index) as [number, number]];
      }
      return result;
    }, [] as [number, number][]);
    return emptyTiles;
  }, [retrieveTileMap]);

  const generateRandomTile = useCallback(() => {
    const emptyTiles = findEmptyTiles();
    if (emptyTiles.length > 0) {
      const index = Math.floor(Math.random() * emptyTiles.length);
      const position = emptyTiles[index];
      createTile({ position, value: 2 });
    }
  }, [findEmptyTiles, createTile]);

  const positionToIndex = (position: [number, number]) => {
    return position[1] * defaultTileCount + position[0];
  };

  const indexToPosition = (index: number) => {
    return [index % defaultTileCount, Math.floor(index / defaultTileCount)];
  };

  type RetrieveTileIdsPerRowOrColumn = (rowOrColumnIndex: number) => number[];

  type CalculateTileIndex = (
    tileIndex: number,
    tileInRowIndex: number,
    howManyMerges: number,
    maxIndexInRow: number
  ) => number;

  const move = (
    retrieveTileIdsPerRowOrColumn: RetrieveTileIdsPerRowOrColumn,
    calculateFirstFreeIndex: CalculateTileIndex
  ) => {
    // new tiles cannot be created during the animation
    dispatch({ type: "START_MOVE" });

    const maxIndex = defaultTileCount - 1;

    // iterates through every row or column (depends on move kind - vertical or horizontal)
    for (
      let rowOrColumnIndex = 0;
      rowOrColumnIndex < defaultTileCount;
      rowOrColumnIndex++
    ) {
      // retrieves tiles in the row or column
      const availableTileIds = retrieveTileIdsPerRowOrColumn(rowOrColumnIndex);

      // previousTile is used to determine if tile can be merged with the current tile
      let previousTile: TileMeta | undefined;
      // mergeCount helps to fill gaps created by tile merges - two tiles become one
      let mergeCount = 0;

      // iterates through available tiles
      availableTileIds.forEach((tileId, nonEmptyTileIndex) => {
        const currentTile = tiles[tileId];

        // if previous tile has the same value as the current one they shlould be merged together
        if (previousTile && currentTile.value === previousTile.value) {
          const tile = {
            ...currentTile,
            position: previousTile.position,
            mergeWith: previousTile.id,
          } as TileMeta;

          // delays the merge by 250ms, so the sliding animation can be completed
          throttledMergeTile(tile, previousTile);
          // previous tile must be cleared as a single tile can be merged only once per move
          previousTile = undefined;
          // increment the merged counter to correct position for the consecutive tiles to get rid of gaps
          mergeCount++;

          return updateTile(tile);
        }

        // else - previous and current tiles are different - move the tile to the first free space
        const tile = {
          ...currentTile,
          position: indexToPosition(
            calculateFirstFreeIndex(
              rowOrColumnIndex,
              nonEmptyTileIndex,
              mergeCount,
              maxIndex
            )
          ),
        } as TileMeta;

        // previous tile become the current tile to check if the next tile can be merged with this one
        previousTile = tile;

        // only if tile has changed its position it will be updated
        if (didTileMove(currentTile, tile)) {
          return updateTile(tile);
        }
      });
    }

    // wait until the end of all animations
    setTimeout(() => {
      dispatch({ type: "END_MOVE" });
    }, animationDuration);
  };

  const moveLeftFactory = () => {
    const retrieveTileIdsByRow = (rowIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInRow = [
        tileMap[rowIndex * defaultTileCount + 0],
        tileMap[rowIndex * defaultTileCount + 1],
        tileMap[rowIndex * defaultTileCount + 2],
        tileMap[rowIndex * defaultTileCount + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((tileId) => tileId !== 0);
      return nonEmptyTiles;
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      howManyMerges: number,
      _: number
    ) => {
      return tileIndex * defaultTileCount + tileInRowIndex - howManyMerges;
    };

    return move.bind(this, retrieveTileIdsByRow, calculateFirstFreeIndex);
  };

  const moveRightFactory = () => {
    const retrieveTileIdsByRow = (rowIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInRow = [
        tileMap[rowIndex * defaultTileCount + 0],
        tileMap[rowIndex * defaultTileCount + 1],
        tileMap[rowIndex * defaultTileCount + 2],
        tileMap[rowIndex * defaultTileCount + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((tileId) => tileId !== 0);
      return nonEmptyTiles.reverse();
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      howManyMerges: number,
      maxIndexInRow: number
    ) => {
      return (
        tileIndex * defaultTileCount +
        maxIndexInRow +
        howManyMerges -
        tileInRowIndex
      );
    };

    return move.bind(this, retrieveTileIdsByRow, calculateFirstFreeIndex);
  };

  const moveUpFactory = () => {
    const retrieveTileIdsByColumn = (columnIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInColumn = [
        tileMap[columnIndex + defaultTileCount * 0],
        tileMap[columnIndex + defaultTileCount * 1],
        tileMap[columnIndex + defaultTileCount * 2],
        tileMap[columnIndex + defaultTileCount * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((tileId) => tileId !== 0);
      return nonEmptyTiles;
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInColumnIndex: number,
      howManyMerges: number,
      _: number
    ) => {
      return tileIndex + defaultTileCount * (tileInColumnIndex - howManyMerges);
    };

    return move.bind(this, retrieveTileIdsByColumn, calculateFirstFreeIndex);
  };

  const moveDownFactory = () => {
    const retrieveTileIdsByColumn = (columnIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInColumn = [
        tileMap[columnIndex + defaultTileCount * 0],
        tileMap[columnIndex + defaultTileCount * 1],
        tileMap[columnIndex + defaultTileCount * 2],
        tileMap[columnIndex + defaultTileCount * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((tileId) => tileId !== 0);
      return nonEmptyTiles.reverse();
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInColumnIndex: number,
      howManyMerges: number,
      maxIndexInColumn: number
    ) => {
      return (
        tileIndex +
        defaultTileCount *
          (maxIndexInColumn - tileInColumnIndex + howManyMerges)
      );
    };

    return move.bind(this, retrieveTileIdsByColumn, calculateFirstFreeIndex);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      createTile({ position: [0, 1], value: 2 });
      createTile({ position: [0, 2], value: 2 });
      isInitialRender.current = false;
      return;
    }

    if (!inMotion && hasChanged) {
      generateRandomTile();
    }
  }, [inMotion, hasChanged, createTile, generateRandomTile]);

  const tileList = byIds.map(tileId => tiles[tileId]);

  const moveLeft = moveLeftFactory();
  const moveRight = moveRightFactory();
  const moveUp = moveUpFactory();
  const moveDown = moveDownFactory();

  return [tileList, moveLeft, moveRight, moveUp, moveDown] as [
    TileMeta[],
    () => void,
    () => void,
    () => void,
    () => void
  ];
};
