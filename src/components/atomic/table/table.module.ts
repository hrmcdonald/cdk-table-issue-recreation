
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtrTable } from './table';
import {
  MtrHeaderCellDef,
  MtrColumnDef,
  MtrCellDef,
  MtrFooterCellDef,
  MtrHeaderCell,
  MtrCell,
  MtrFooterCell,
} from './cell';
import {
  MtrHeaderRowDef,
  MtrRowDef,
  MtrFooterRowDef,
  MtrHeaderRow,
  MtrRow,
  MtrFooterRow,
  MtrNoDataRow,
} from './row';
import { CdkTableModule } from '@angular/cdk/table';
import { MtrTableContainer } from './table-container';

const COMPONENTS = [
  // Container
  MtrTableContainer,

  // Table
  MtrTable,

  // Template defs
  MtrHeaderCellDef,
  MtrHeaderRowDef,
  MtrColumnDef,
  MtrCellDef,
  MtrRowDef,
  MtrFooterCellDef,
  MtrFooterRowDef,

  // Cell directives
  MtrHeaderCell,
  MtrCell,
  MtrFooterCell,

  // Row directives
  MtrHeaderRow,
  MtrRow,
  MtrFooterRow,
  MtrNoDataRow,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, CdkTableModule],
  exports: [...COMPONENTS],
})
export class MtrTableModule {}
