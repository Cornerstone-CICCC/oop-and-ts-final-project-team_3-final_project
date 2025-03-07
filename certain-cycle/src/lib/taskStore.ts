import { atom } from "nanostores";
import type { Task } from "./types";
import type { Column } from "./types";

export class TaskContext {
  private static instance: TaskContext;
  private filter: string = "";
  private listenerFunctions: (() => void)[] = [];
  private $columns = atom<Column[]>([]);

  static getInstance() {
    if (!TaskContext.instance) {
      TaskContext.instance = new TaskContext();
    }
    console.log("TaskContext instance created");
    console.log(TaskContext.instance);
    return TaskContext.instance;
  }

  private constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const storedColumns = localStorage.getItem("tasks");
    if (storedColumns) {
      this.$columns.set(JSON.parse(storedColumns));
    } else {
      this.$columns.set([
        {
          tasks: [
            {
              id: 4,
              title: "Investigate WebView Issue on iOS 18",
              description:
                "Analyze and debug the issue where WebView fails to load local scripts in iOS 18. Check CSP policies, file paths, and WebKit updates.",
              label: "Backlog",
            },
            {
              id: 5,
              title: "Migrate Logs to Structured Logging Format",
              description:
                "Transition from unstructured console logs to a structured logging framework like Winston or Pino. Ensure logs support JSON format for better observability.",
              label: "Backlog",
            },
            {
              id: 6,
              title: "Improve CI/CD Pipeline Performance",
              description:
                "Investigate long build times in the CI/CD pipeline. Optimize caching strategies and reduce redundant steps in GitHub Actions.",
              label: "Backlog",
            },
            {
              id: 7,
              title: "Enhance Error Reporting in Web Components",
              description:
                "Improve error logging within exported Web Components to include stack traces, component names, and timestamps for better debugging.",
              label: "Backlog",
            },
            {
              id: 8,
              title: "Add End-to-End Tests for Payment Flow",
              description:
                "Write Cypress tests to validate the complete checkout process, ensuring that payment methods, discounts, and confirmation pages work as expected.",
              label: "Backlog",
            },
          ],
          label: "Backlog",
        },
        {
          tasks: [
            {
              id: 1,
              title: "Implement Feature Toggle System",
              description:
                "Develop a feature flag system to enable/disable features dynamically. Ensure it's configurable via an admin panel.",
              label: "todo",
            },
          ],
          label: "To Do",
        },
        {
          tasks: [
            {
              id: 2,
              title: "Refactor Authentication Logic",
              description:
                "Migrate authentication from session-based to JWT. Update middleware and ensure backward compatibility.",
              label: "In Progress",
            },
          ],
          label: "In Progress",
        },
        {
          tasks: [
            {
              id: 3,
              title: "Optimize Database Queries",
              description:
                "Analyze slow queries using performance logs. Add indexes and optimize joins to improve response time.",
              label: "done",
            },
          ],
          label: "Done",
        },
      ]);
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.$columns.get()));
  }

  updateFilter(keyword: string) {
    this.filter = keyword;
    if (keyword.length >= 3) {
      this.notifyListeners();
    } else {
      this.filter = "";
      this.notifyListeners();
    }
  }

  getTask(id: number, label: string) {
    return this.$columns
      .get()
      .find((column) => column.label === label)
      ?.tasks.find((task: { id: number }) => task.id === id);
  }

  getColumns() {
    const filter = this.filter;
    if (!filter) return this.$columns.get();

    const filteredColumns = this.$columns.get().map((column) => {
      const matchedTasks = column.tasks.filter(
        (task: { title: string; description: string }) =>
          task.title.toLowerCase().includes(this.filter.toLowerCase()) ||
          task.description.toLowerCase().includes(this.filter.toLowerCase())
      );
      return { ...column, tasks: matchedTasks };
    });

    return filteredColumns;
  }

  getLabels() {
    return this.$columns.get().map((column) => column.label);
  }

  addColumn(label: string) {
    const columns = this.$columns.get();
    let newLabel = label;
    let counter = 1;
    while (columns.find((column) => column.label === newLabel)) {
      newLabel = `${label} ${counter}`;
      counter++;
    }
    columns.push({ label: newLabel, tasks: [] });
    this.$columns.set(columns);
    this.notifyListeners();
  }

  deleteColumn(label: string) {
    this.$columns.set(
      this.$columns.get().filter((column) => column.label !== label)
    );
    this.notifyListeners();
  }

  updateColumnLabel(label: string, newLabel: string) {
    const columns = this.$columns.get();
    const targetColumn = columns.find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.label = newLabel;

    this.$columns.set(columns);
    this.notifyListeners();
  }

  // Task Manipulation
  addTask(title: string, description: string, label: string) {
    const columns = this.$columns.get();
    const targetColumn = columns.find((column) => column.label === label);

    if (!targetColumn) return;

    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      label,
    };

    targetColumn.tasks = [...targetColumn.tasks, newTask];

    this.notifyListeners();
  }

  updateTaskLabel(taskId: number, preLabel: string, newLabel: string) {
    const columns = this.$columns.get();
    const fromColumn = columns.find((column) => column.label === preLabel);
    const toColumn = columns.find((column) => column.label === newLabel);
    if (!fromColumn || !toColumn) return;

    const taskIndex = fromColumn.tasks.findIndex(
      (task: { id: number }) => task.id === taskId
    );
    if (taskIndex === -1) return;

    // Remove the task from the source column and get it
    const [task] = fromColumn.tasks.splice(taskIndex, 1);
    // Insert the task at the new index in the destination column
    toColumn.tasks.push(task);

    // Notification
    this.notifyListeners();
  }

  moveTask(
    taskId: number,
    preLabel: string,
    newLabel: string,
    newIndex: number
  ) {
    const columns = this.$columns.get();
    const fromColumn = columns.find((column) => column.label === preLabel);
    const toColumn = columns.find((column) => column.label === newLabel);
    if (!fromColumn || !toColumn) return;

    const taskIndex = fromColumn.tasks.findIndex(
      (task: { id: number }) => task.id === taskId
    );
    if (taskIndex === -1) return;

    // Remove the task from the source column and get it
    const [task] = fromColumn.tasks.splice(taskIndex, 1);

    // Insert the task at the new index in the destination column
    toColumn.tasks.splice(newIndex, 0, task);

    // Notification
    this.notifyListeners();
  }

  editTask(
    label: string,
    taskId: number,
    newTitle: string,
    newDescription: string
  ) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.tasks = targetColumn.tasks.map((task) =>
      task.id === taskId
        ? { ...task, title: newTitle, description: newDescription }
        : task
    );

    this.$columns.set(
      this.$columns.get().map((c) => (c.label === label ? targetColumn : c))
    );
    this.notifyListeners();
  }

  updateTaskTitle(taskId: number, label: string, newTitle: string) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.tasks = targetColumn.tasks.map((task) =>
      task.id === taskId ? { ...task, title: newTitle } : task
    );
    this.notifyListeners();
  }

  updateTaskDescription(taskId: number, label: string, newDescription: string) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.tasks = targetColumn.tasks.map((task) =>
      task.id === taskId ? { ...task, description: newDescription } : task
    );
    this.notifyListeners();
  }

  deleteTask(id: number, label: string) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);

    if (!targetColumn) return;

    const updateColumnTasks = targetColumn.tasks.filter(
      (task: { id: number }) => task.id !== id
    );

    // entire column
    this.$columns.set(
      this.$columns
        .get()
        .map((c) =>
          c.label === label ? { ...targetColumn, tasks: updateColumnTasks } : c
        )
    );

    this.notifyListeners();
  }

  // Notification
  addListener(listener: () => void) {
    this.listenerFunctions.push(listener);
  }

  notifyListeners() {
    this.listenerFunctions.forEach((listener) => listener());
    this.saveToLocalStorage();
  }
  // end of Notification
}
