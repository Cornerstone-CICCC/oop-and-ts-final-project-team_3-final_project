import type { Column } from "../store";
import { columns } from "../store";

export class ColumnService implements IColumnService {
  public getColumns() {
    return columns.get();
  }
  public upsertColumn(column: Column) {
    columns.set([...columns.get(), column]);
  }
  public removeColumn(id: string) {
    return columns.set([...columns.get().filter((column) => column.id !== id)]);
  }
}

export interface IColumnService {
  getColumns: () => Array<Column>;
  upsertColumn: (column: Column) => void;
  removeColumn: (id: string) => void;
}
