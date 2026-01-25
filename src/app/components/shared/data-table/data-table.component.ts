import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'actions';
  format?: (value: any, row?: any) => string;
}

export interface TableAction {
  label: string;
  icon?: string;
  class?: string;
  onClick: (row: any) => void;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'Aucune donnée disponible';

  @Output() rowClick = new EventEmitter<any>();

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  getCellValue(row: any, column: TableColumn): any {
    const value = this.getNestedValue(row, column.key);

    if (column.format) {
      return column.format(value, row);
    }

    return value ?? '-';
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  executeAction(action: TableAction, row: any, event: Event): void {
    event.stopPropagation();
    action.onClick(row);
  }
}

