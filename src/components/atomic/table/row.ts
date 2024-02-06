import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  CDK_ROW_TEMPLATE,
  CdkFooterRow,
  CdkFooterRowDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkRow,
  CdkRowDef,
  CdkNoDataRow,
} from '@angular/cdk/table';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  Input,
} from '@angular/core';

/**
 * Header row definition for the mtr-table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({
  selector: '[mtrHeaderRowDef]',
  providers: [{ provide: CdkHeaderRowDef, useExisting: MtrHeaderRowDef }],
  inputs: ['columns: mtrHeaderRowDef', 'sticky: mtrHeaderRowDefSticky'],
})
export class MtrHeaderRowDef extends CdkHeaderRowDef {
  // Defaults the value of the header rows stickyness to true
  @Input('mtrHeaderRowDefSticky')
  override get sticky(): boolean {
    return this._sticky;
  }
  override set sticky(v: BooleanInput) {
    const prevValue = this._sticky;
    this._sticky = coerceBooleanProperty(v);
    this._hasStickyChanged = prevValue !== this._sticky;
  }
  _sticky: boolean = true;
}

/**
 * Footer row definition for the mtr-table.
 * Captures the footer row's template and other footer properties such as the columns to display.
 */
@Directive({
  selector: '[mtrFooterRowDef]',
  providers: [{ provide: CdkFooterRowDef, useExisting: MtrFooterRowDef }],
  inputs: ['columns: mtrFooterRowDef', 'sticky: mtrFooterRowDefSticky'],
})
export class MtrFooterRowDef extends CdkFooterRowDef {}

/**
 * Data row definition for the mtr-table.
 * Captures the data row's template and other properties such as the columns to display and
 * a when predicate that describes when this row should be used.
 */
@Directive({
  selector: '[mtrRowDef]',
  providers: [{ provide: CdkRowDef, useExisting: MtrRowDef }],
  inputs: ['columns: mtrRowDefColumns', 'when: mtrRowDefWhen'],
})
export class MtrRowDef<T> extends CdkRowDef<T> {}

/** Footer template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'tr[mtr-header-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    class: 'mtr-row--header',
    role: 'row',
  },
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mtrHeaderRow',
  providers: [{ provide: CdkHeaderRow, useExisting: MtrHeaderRow }],
})
export class MtrHeaderRow extends CdkHeaderRow {}

/** Footer template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'tr[mtr-footer-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    class: 'mtr-row--footer',
    role: 'row',
  },
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mtrFooterRow',
  providers: [{ provide: CdkFooterRow, useExisting: MtrFooterRow }],
})
export class MtrFooterRow extends CdkFooterRow {}

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'tr[mtr-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mtr-row',
    'role': 'row',
    '[class.mtr-table__row--hoverable]': 'hoverable',
    '[class.mtr-table__row--selectable]': 'selectable',
    '[class.mtr-table__row--active]': 'active',
  },
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mtrRow',
  providers: [{ provide: CdkRow, useExisting: MtrRow }],
})
export class MtrRow extends CdkRow {
  /**
   * Wether or not this row should highlight on hover.
   * Use to indicate this row is actionable in some fashion
   */
  @Input()
  set hoverable(hoverable: boolean) {
    this._hoverable = coerceBooleanProperty(hoverable);
  }
  get hoverable() {
    return this._hoverable;
  }
  private _hoverable = false;

  /**
   * Wether or not this row should highlight on hover with a pointer cursor.
   * Use to indicate this row is actionable or selectable in some fashion.
   */
  @Input()
  set selectable(selectable: boolean) {
    this._selectable = coerceBooleanProperty(selectable);
  }
  get selectable() {
    return this._selectable;
  }
  private _selectable = false;

  /** Wether this row should be highlighted as active */
  @Input() active = false;

  static ngAcceptInputType_hoverable: BooleanInput;
  static ngAcceptInputType_selectable: BooleanInput;
}

/** Row that can be used to display a message when no data is shown in the table. */
@Directive({
  selector: 'ng-template[mtrNoDataRow]',
  providers: [{ provide: CdkNoDataRow, useExisting: MtrNoDataRow }],
})
export class MtrNoDataRow extends CdkNoDataRow {}
