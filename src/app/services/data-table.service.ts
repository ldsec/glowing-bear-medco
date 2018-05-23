import {Injectable} from '@angular/core';
import {Dimension} from '../models/table-models/dimension';
import {DataTable} from '../models/table-models/data-table';
import {Row} from '../models/table-models/row';
import {ResourceService} from './resource.service';
import {Col} from '../models/table-models/col';
import {ConstraintService} from './constraint.service';
import {HeaderRow} from '../models/table-models/header-row';

@Injectable()
export class DataTableService {

  private _prevRowDimensions: Array<Dimension>;
  private _prevColDimensions: Array<Dimension>;
  private _dataTable: DataTable;

  constructor(private resourceService: ResourceService,
              private constraintService: ConstraintService) {
    this.dataTable = new DataTable();
    this.prevRowDimensions = [];
    this.prevColDimensions = [];
    this.updateDataTable();
  }

  updateDataTable(targetDataTable?: DataTable) {
    this.dataTable.isDirty = true;
    this.dataTable.isUpdating = true;
    this.dataTable = targetDataTable ? targetDataTable : this.dataTable;
    const constraint_1_2 = this.constraintService.constraint_1_2();
    this.dataTable.constraint = constraint_1_2;

    this.resourceService.getDataTable(this.dataTable)
      .subscribe(
        (newDataTable: DataTable) => {
          this.dataTable = newDataTable;
          this.dataTable.isDirty = false;
          this.dataTable.isUpdating = false;
          this.updatePrevDimensions();
        }
      );
  }

  public nextPage() {
    if (!this.dataTable.isLastPage) {
      this.dataTable.currentPage++;
      this.updateDataTable();
    }
  }

  public previousPage() {
    if (this.dataTable.currentPage > 1) {
      this.dataTable.currentPage--;
      this.updateDataTable();
    }
  }

  public updatePrevDimensions() {
    this.prevRowDimensions = [];
    this.rowDimensions.forEach((dim: Dimension) => {
      this.prevRowDimensions.push(new Dimension(dim.name));
    });
    this.prevColDimensions = [];
    this.columnDimensions.forEach((dim: Dimension) => {
      this.prevColDimensions.push(new Dimension(dim.name));
    });
  }

  get rowDimensions(): Dimension[] {
    return this.dataTable.rowDimensions;
  }

  set rowDimensions(value: Dimension[]) {
    this.dataTable.rowDimensions = value;
  }

  get columnDimensions(): Dimension[] {
    return this.dataTable.columnDimensions;
  }

  set columnDimensions(value: Dimension[]) {
    this.dataTable.columnDimensions = value;
  }

  get rows(): Row[] {
    return this.dataTable.rows;
  }

  get cols(): Col[] {
    return this.dataTable.cols;
  }

  get headerRows(): Array<HeaderRow> {
    return this.dataTable.headerRows;
  }

  get dataTable(): DataTable {
    return this._dataTable;
  }

  set dataTable(value: DataTable) {
    this._dataTable = value;
  }

  get prevRowDimensions(): Array<Dimension> {
    return this._prevRowDimensions;
  }

  set prevRowDimensions(value: Array<Dimension>) {
    this._prevRowDimensions = value;
  }

  get prevColDimensions(): Array<Dimension> {
    return this._prevColDimensions;
  }

  set prevColDimensions(value: Array<Dimension>) {
    this._prevColDimensions = value;
  }

  get isUsingHeaders(): boolean {
    return this.dataTable.isUsingHeaders;
  }

}