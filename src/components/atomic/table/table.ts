import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  Input,
  AfterContentInit,
} from '@angular/core';
import { Subscriber, Observable } from 'rxjs';
import {
  CdkTable,
  CDK_TABLE,
  _COALESCED_STYLE_SCHEDULER,
  _CoalescedStyleScheduler,
  CdkHeaderRowDef,
  STICKY_POSITIONING_LISTENER,
} from '@angular/cdk/table';
import { _DisposeViewRepeaterStrategy, _VIEW_REPEATER_STRATEGY } from '@angular/cdk/collections';

export { CdkTable } from '@angular/cdk/table';

@Component({
  selector: 'table[mtr-table]',
  exportAs: 'mtrTable',
  templateUrl: 'table.html',
  styleUrls: ['./table.scss'],
  host: {
    'class': 'mtr-table',
    '[class.mtr-table--dense]': 'dense',
    '[class.mtr-table--not-striped]': '!striped',
    '[class.mtr-table--bordered]': 'bordered',
    '[class.mtr-table--multi-row]': 'multiTemplateDataRows',
    '[class.mtr-table--fixed-layout]': 'fixedLayout',
    '[style.width.px]': 'scrollWidth',
    'ngSkipHydration': '',
  },
  providers: [
    { provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy },
    { provide: CdkTable, useExisting: MtrTable },
    { provide: CDK_TABLE, useExisting: MtrTable },
    { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
    // Prevent nested tables from seeing this table's StickyPositioningListener.
    { provide: STICKY_POSITIONING_LISTENER, useValue: null },
  ],
  encapsulation: ViewEncapsulation.None,
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MtrTable<T> extends CdkTable<T> implements AfterContentInit {
  /** Overrides the sticky CSS class set by the `CdkTable`. */
  protected override stickyCssClass = 'mtr-table--sticky';

  /** Overrides the need to add position: sticky on every sticky cell element in `CdkTable`. */
  protected override needsPositionStickyOnElement = false;

  /**
   * Used by an MtrTableContainer to set a width on this table element.
   * Setting this to null will remove the width styling.
   * @ignore
   */
  set scrollWidth(scrollWidth: number | null) {
    const oldWidth = this._scrollWidth;
    this._scrollWidth = scrollWidth ?? null;
    if (oldWidth !== scrollWidth) {
      this._changeDetectorRef.markForCheck();
    }
  }
  get scrollWidth() {
    return this._scrollWidth;
  }
  private _scrollWidth?: number = null;

  /** Whether or not the table should render with dense padding. */
  @Input()
  set dense(dense: boolean) {
    this._dense = coerceBooleanProperty(dense);
  }
  get dense() {
    return this._dense;
  }
  private _dense = false;

  /** Text that is displayed when no data is present. Defaults to "No items to display" */
  @Input() emptyText = 'No items to display';

  /** Wether or not the table rows should alternate a grey background color */
  @Input()
  set striped(striped: boolean) {
    this._striped = coerceBooleanProperty(striped);
  }
  get striped() {
    return this._striped;
  }
  private _striped = true;

  /** Wether or not this table should include a border */
  @Input()
  set bordered(bordered: boolean) {
    this._bordered = coerceBooleanProperty(bordered);
  }
  get bordered() {
    return this._bordered;
  }
  private _bordered = false;

  /** Whether this directive has been marked as initialized. */
  private isInitialized = false;

  /**
   * List of subscribers that subscribed before the directive was initialized. Should be notified
   * during _markInitialized. Set to null after pending subscribers are notified, and should
   * not expect to be populated after.
   */
  private pendingSubscribers: Subscriber<void>[] | null = [];

  /**
   * Observable stream that emits when the table initializes. If already initialized, the
   * subscriber is stored to be notified once markInitialized is called.
   */
  initialized = new Observable<void>((subscriber) => {
    // If initialized, immediately notify the subscriber. Otherwise store the subscriber to notify
    // when markInitialized is called.
    if (this.isInitialized) {
      this.notifySubscriber(subscriber);
    } else {
      this.pendingSubscribers!.push(subscriber);
    }
  });

  override ngAfterContentInit(): void {
    this.markInitialized();
  }

  /**
   * @ignore
   */
  public _hasData() {
    return this._data && this._data.length > 0;
  }

  /**
   * Marks the state as initialized and notifies pending subscribers. Should be called at the end
   * of ngOnInit.
   */
  private markInitialized(): void {
    if (this.isInitialized) {
      throw Error(
        'This directive has already been marked as initialized and ' + 'should not be called twice.'
      );
    }

    this.isInitialized = true;

    this.pendingSubscribers!.forEach(this.notifySubscriber);
    this.pendingSubscribers = null;
  }

  /** Emits and completes the subscriber stream (should only emit once). */
  private notifySubscriber(subscriber: Subscriber<void>): void {
    subscriber.next(null);
    subscriber.complete();
  }

  getNoDataColSpan() {
    try {
      if (this['_headerRowDefs']?.length > 0) {
        const headerRow = this['_headerRowDefs'][0] as CdkHeaderRowDef;
        if (headerRow?.columns) {
          const headerColumnsArr = Array.from(headerRow?.columns);
          return headerColumnsArr.length;
        }
      }
    } catch (e) {}
    return 1000000;
  }

  static ngAcceptInputType_bordered: BooleanInput;
  static ngAcceptInputType_striped: BooleanInput;
  static ngAcceptInputType_dense: BooleanInput;
}
