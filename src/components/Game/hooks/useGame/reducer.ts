import { TileMeta } from "../../../Tile/models/Tile";

type State = {
  tiles: { [id: number]: TileMeta };
  inMotion: boolean;
  hasChanged: boolean;
  byIds: number[];
};

type Action =
  | { type: "CREATE_TILE"; tile: TileMeta }
  | { type: "UPDATE_TILE"; tile: TileMeta }
  | { type: "MERGE_TILE"; source: TileMeta; destination: TileMeta }
  | { type: "START_MOVE" }
  | { type: "END_MOVE" };

export const initialState: State = {
  tiles: {},
  inMotion: false,
  hasChanged: false,
  byIds: [],
};

export const GameReducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case "CREATE_TILE":
      const { tile } = action;
      const { id } = tile;
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [id]: tile,
        },
        hasChanged: false,
        byIds: [...state.byIds, id],
      };
    case "UPDATE_TILE":
      const { tile: tileToUpdate } = action;
      const { id: idToUpdate } = tileToUpdate;
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [idToUpdate]: tileToUpdate,
        },
        hasChanged: true,
      };
    case "MERGE_TILE":
      const {
        [action.source.id]: source,
        [action.destination.id]: destination,
        ...restTiles
      } = state.tiles;
      return {
        ...state,
        tiles: {
          ...restTiles,
          [action.destination.id]: {
            id: action.destination.id,
            value: action.source.value + action.destination.value,
            position: action.destination.position,
          },
        },
        byIds: state.byIds.filter((id) => id !== action.source.id),
        hasChanged: true,
      };
    case "START_MOVE":
      return {
        ...state,
        inMotion: true,
      };
    case "END_MOVE":
      return {
        ...state,
        inMotion: false,
      };
    default:
      return state;
  }
};
