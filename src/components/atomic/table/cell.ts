/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Directive, ElementRef, Input } from '@angular/core';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkFooterCell,
  CdkFooterCellDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
} from '@angular/cdk/table';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

/**
 * Cell definition for the mtr-table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({
  selector: '[mtrCellDef]',
  providers: [{ provide: CdkCellDef, useExisting: MtrCellDef }],
})
export class MtrCellDef extends CdkCellDef {}

/**
 * Header cell definition for the mtr-table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[mtrHeaderCellDef]',
  providers: [{ provide: CdkHeaderCellDef, useExisting: MtrHeaderCellDef }],
})
export class MtrHeaderCellDef extends CdkHeaderCellDef {}

/**
 * Footer cell definition for the mtr-table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[mtrFooterCellDef]',
  providers: [{ provide: CdkFooterCellDef, useExisting: MtrFooterCellDef }],
})
export class MtrFooterCellDef extends CdkFooterCellDef {}

/**
 * Column definition for the mtr-table.
 * Defines a set of cells available for a table column.
 */
@Directive({
  selector: '[mtrColumnDef]',
  providers: [
    { provide: CdkColumnDef, useExisting: MtrColumnDef },
    // This has to be "MAT_SORT_HEADER_COLUMN_DEF" because
    // that is what the CdkColumnDef is provided as
    { provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: MtrColumnDef },
  ],
})
export class MtrColumnDef extends CdkColumnDef {
  /** Unique name for this column. */
  @Input('mtrColumnDef')
  override get name(): string {
    return this._name;
  }
  override set name(name: string) {
    this._setNameInput(name);
  }

  /** Whether this column should be sticky positioned at the start of the row */
  @Input()
  override get sticky(): boolean {
    return this._sticky;
  }
  override set sticky(v: BooleanInput) {
    const prevValue = this._sticky;
    this._sticky = coerceBooleanProperty(v);
    this._hasStickyChanged = prevValue !== this._sticky;
  }
  _sticky: boolean = false;

  /**
   * Add "mtr-column-" prefix in addition to "cdk-column-" prefix.
   * In the future, this will only add "mtr-column-" and columnCssClassName
   * will change from type string[] to string.
   * @ignore
   */
  protected override _updateColumnCssClassName() {
    super._updateColumnCssClassName();
    this._columnCssClassName!.push(`mtr-column--${this.cssClassFriendlyName}`);
  }
}

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'th[mtr-header-cell]',
  host: {
    class: 'mtr-cell--header',
    role: 'columnheader',
  },
})
export class MtrHeaderCell extends CdkHeaderCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef<HTMLElement>) {
    super(columnDef, elementRef);
    elementRef.nativeElement.classList.add(`mtr-column--${columnDef.cssClassFriendlyName}`);
  }
}

/** Footer cell template container that adds the right classes and role. */
@Directive({
  selector: 'td[mtr-footer-cell]',
  host: {
    class: 'mtr-cell--footer',
    role: 'gridcell',
  },
})
export class MtrFooterCell extends CdkFooterCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef<HTMLElement>) {
    super(columnDef, elementRef);
    elementRef.nativeElement.classList.add(`mtr-column--${columnDef.cssClassFriendlyName}`);
  }
}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'td[mtr-cell]',
  host: {
    class: 'mtr-cell',
    role: 'gridcell',
  },
})
export class MtrCell extends CdkCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef<HTMLElement>) {
    super(columnDef, elementRef);
    elementRef.nativeElement.classList.add(`mtr-column--${columnDef.cssClassFriendlyName}`);
  }
}
