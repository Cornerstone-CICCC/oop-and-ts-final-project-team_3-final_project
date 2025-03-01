import { users } from "../store";
import type { User } from "../store";

export class UserService implements IUserService {
  public find(id: string) {
    const userItem = users.get().find((user) => user.id === id);
    return userItem ? userItem : null;
  }
  public upsert(user: User) {
    users.set([...users.get(), user]);
    return user;
  }
  public remove(id: string) {
    users.set([...users.get().filter((item) => item.id !== id)]);
  }
}

export interface IUserService {
  find: (id: string) => User | null;
  upsert: (user: User) => User;
  remove: (id: string) => void;
}
