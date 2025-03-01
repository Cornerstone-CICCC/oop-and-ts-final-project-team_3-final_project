import { persistentAtom } from "@nanostores/persistent";

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  createdOn: string;
}

export const users = persistentAtom<Array<User>>("users", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});
