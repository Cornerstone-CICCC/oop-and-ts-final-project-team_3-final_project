// Unique identifiers for our tasks and columns
export type TaskId = `task_${string}`;
export type ColumnId = `col_${string}`;

export interface Task {
  id: number;
  title: string;
  description: string;
  label: string;
}

export interface Column {
  tasks: Task[];
  label: string;
}
