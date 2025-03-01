import { persistentAtom } from "@nanostores/persistent";

export interface Column {
  id: string;
  title: string;
  createdOn: Date;
}

export const columns = persistentAtom<Array<Column>>("columns", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});
