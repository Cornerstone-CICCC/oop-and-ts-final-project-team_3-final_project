import { persistentAtom } from "@nanostores/persistent";

export interface Todo {
  id: string;
  title: string;
  description: string;
  state: string;
  tags: Array<string>;
  createdOn: Date;
  assignedTo: Array<string>;
  createdByUserId: string;
  columnId: string;
}

export const todos = persistentAtom<Array<Todo>>("todos", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});
