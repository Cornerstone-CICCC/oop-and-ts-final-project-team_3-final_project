import { todos } from "../store";
import type { Todo } from "../store";

export class TaskService implements ITaskService {
  public findTodo(id: string) {
    const todoItem = todos.get().find((todo) => todo.id === id);
    return todoItem ? todoItem : null;
  }
  public upsertTodo(todo: Todo) {
    todos.set([...todos.get(), todo]);
    return todo;
  }
  public removeTodo(id: string) {
    todos.set([...todos.get().filter((item) => item.id !== id)]);
  }
  public getColumnTodos(columnId: string) {
    return todos.get().filter((item) => item.columnId === columnId);
  }
}

export interface ITaskService {
  findTodo: (id: string) => Todo | null;
  upsertTodo: (todo: Todo) => Todo;
  removeTodo: (id: string) => void;
  getColumnTodos: (columnId: string) => Todo[];
}
