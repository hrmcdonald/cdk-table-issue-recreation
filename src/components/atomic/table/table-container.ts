import {
  coerceBooleanProperty,
  BooleanInput,
  coerceNumberProperty,
  NumberInput,
} from '@angular/cdk/coercion';
import {
  Component,
  AfterContentInit,
  OnDestroy,
  Input,
  ContentChildren,
  QueryList,
} from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { startWith, takeUntil, tap } from 'rxjs/operators';
import { MtrAbstractTableDataSource } from './abstract-table-data-source';
import { MtrTable } from './table';

/**
 * Offset value used to account for paginator
 * height into table sizing restrictions.
 */
const PAGINATOR_HEIGHT = 57;

/**
 * A container component for housing all table related components
 */
@Component({
  selector: 'mtr-table-container',
  template: `
    <div class="mtr-table-container__overflow-container">
      <div
        class="mtr-table-container__scroll-container"
        [style.minHeight.px]="!flexHeight && minHeight ? minHeight : null"
        [style.maxHeight.px]="!flexHeight && maxHeight ? maxHeight : null"
        [style.height.px]="!flexHeight && height ? height : null">
        <ng-content></ng-content>
        <span class="mtr-table-container__flex-spacer"></span>
      </div>
      <ng-content select="mtr-paginator"></ng-content>
    </div>
  `,
  host: {
    'class': 'mtr-table-container',
    '[class.mtr-table-container--with-paginator]': 'hasPaginator',
    '[class.mtr-table-container--hide-shadow]': 'hideShadow',
    '[class.mtr-table-container--flex-height]': 'flexHeight',
    '[class.mtr-table-container--fixed-layout]': 'fixedLayout',
    '[style.minHeight.px]': '!flexHeight && minHeight ? minHeight : null',
    '[style.maxHeight]': 'getMaxHeight()',
    '[style.height.px]': '!flexHeight && height ? height : null',
    '[style.width.px]': 'width ? width : null',
  },
})
export class MtrTableContainer implements AfterContentInit, OnDestroy {
  paginatorHeight = PAGINATOR_HEIGHT;

  /**
   * Automatically locates child table components within this container. If the table
   * includes a dataSource the first available sort/multi-sort and/or paginator will
   * be configured accordingly. This is `true` by default. We recommend leaving it enabled.
   */
  @Input()
  set auto(auto: boolean) {
    this._auto = coerceBooleanProperty(auto);
  }
  get auto() {
    return this._auto;
  }
  private _auto = true;

  /** Prevents any shadows from being applied to the table container */
  @Input()
  set hideShadow(hideShadow: boolean) {
    this._hideShadow = coerceBooleanProperty(hideShadow);
  }
  get hideShadow(): boolean {
    return this._hideShadow;
  }
  private _hideShadow = false;

  /** Width of this table container in px. The table will grow to fill this width. */
  @Input()
  set width(width: number) {
    this._width = coerceNumberProperty(width);
  }
  get width(): number {
    return this._width;
  }
  private _width: number;

  /**
   * Width the table inside of this container. The table will be set to this
   * width so it scrolls with this container width is smaller that it.
   */
  @Input()
  set scrollWidth(scrollWidth: number) {
    this._scrollWidth = coerceNumberProperty(scrollWidth);
    if (this.tables?.first) {
      this.tables.first.scrollWidth = this._scrollWidth;
    }
  }
  get scrollWidth(): number {
    return this._scrollWidth;
  }
  private _scrollWidth: number;

  /** Height of this table container in px. The table will grow to fill this height. */
  @Input()
  set height(height: number) {
    this._height = coerceNumberProperty(height);
  }
  get height(): number {
    return this._height - this.paginatorHeight;
  }
  private _height: number;

  /** Minimum height of this table container in px. The table will grow to fill this height. */
  @Input()
  set minHeight(minHeight: number) {
    this._minHeight = coerceNumberProperty(minHeight);
  }
  get minHeight(): number {
    return this._minHeight - this.paginatorHeight;
  }
  private _minHeight: number;

  /**
   * Maximum height of this table container in px. The table will be restricted
   * to this height and scroll within it when data overflows.
   */
  @Input()
  set maxHeight(maxHeight: number) {
    this._maxHeight = coerceNumberProperty(maxHeight);
  }
  get maxHeight(): number {
    return this._maxHeight - this.paginatorHeight;
  }
  private _maxHeight: number;

  /**
   * Configures the table to grow to fill a flex parent container.
   * Overrides min/max height inputs.
   */
  @Input()
  set flexHeight(flexHeight: boolean) {
    this._flexHeight = coerceBooleanProperty(flexHeight);
  }
  get flexHeight(): boolean {
    return this._flexHeight;
  }
  private _flexHeight: boolean;

  /** Applies `table-layout: fixed` styling to the inner table. Sometimes useful when using the virtual table data source. */
  @Input()
  set fixedLayout(fixedLayout: boolean) {
    this._fixedLayout = coerceBooleanProperty(fixedLayout);
  }
  get fixedLayout(): boolean {
    return this._fixedLayout;
  }
  private _fixedLayout: boolean;

  private destroyed = new Subject();

  /** @ignore */
  hasPaginator = false;

  @ContentChildren(MtrTable, { descendants: true }) private tables: QueryList<MtrTable<any>>;

  ngAfterContentInit() {
    if (this.auto) {
      combineLatest([
        this.tables.changes.pipe(startWith(null)),
      ])
        .pipe(
          takeUntil(this.destroyed),
          tap(() => {
            if (this.tables?.first) {
              this.tables.first.scrollWidth = this._scrollWidth;
            }
            this.configureDataSourceWithChildren();
          })
        )
        .subscribe();
    }
  }

  ngOnDestroy() {
    this.destroyed.next(null);
    this.destroyed.complete();
  }

  /** @ignore */
  getMaxHeight() {
    if (this.flexHeight) {
      return '100%';
    } else {
      return `${this.maxHeight}px` ?? null;
    }
  }

  private configureDataSourceWithChildren() {
    const table = this.tables.first;
    const dataSource = table?.dataSource as MtrAbstractTableDataSource<any>;
  }

  static ngAcceptInputType_auto: BooleanInput;
  static ngAcceptInputType_hideShow: BooleanInput;
  static ngAcceptInputType_minHeight: NumberInput;
  static ngAcceptInputType_maxHeight: NumberInput;
  static ngAcceptInputType_flexHeight: BooleanInput;
}
