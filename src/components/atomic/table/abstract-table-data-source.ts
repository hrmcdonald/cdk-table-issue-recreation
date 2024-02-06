import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { getMtrTableDataSourceMultiSortContainerError } from './table-errors';
import { take } from 'rxjs/operators';

export abstract class MtrAbstractTableDataSource<T> extends DataSource<T> {
  /** Stream emitting render data to the table (depends on ordered data changes). */
  protected readonly renderDataSubj = new BehaviorSubject<T[]>([]);

  /** Stream that emits when a new global filter string is set on the data source. */
  protected readonly globalFilterSubj = new BehaviorSubject<string>('');

  /** Stream emitting the loading state of the table */
  protected readonly loadingSubj = new BehaviorSubject<boolean>(false);

  /** Emits the loading state of the table */
  public readonly loading$: Observable<boolean> = this.loadingSubj.asObservable();

  /** Emits filter value changes */
  public readonly globalFilter$: Observable<string> = this.globalFilterSubj.asObservable();

  /**
   * Subject to the changes that should trigger an update to the table's rendered rows, such
   * as filtering, sorting, pagination, or base data changes.
   */
  protected renderChangesSubj = new Subject<any>();

  protected updateChangeSubscription() {
    throw new Error('Method not implemented.');
  }

  /**
   * Applies a global filter to the data source by setting the filter value.
   * @param filterValue The filter value to be applied to the data set. To override how
   * data objects match to this filter string, provide a custom function for filterPredicate.
   * @param resetPage When true, any paginator registered with this data source will attempt
   * to jump to its first page. Defaults to true.
   */
  public filterGlobal(filterValue: string, resetPage: boolean = true) {
    this.globalFilterSubj.next(filterValue);
  }

  /**
   * Used by the MtrTable. Called when it connects to the data source.
   * @ignore
   */
  connect() {
    return this.renderDataSubj;
  }

  /**
   * Used by the MtrTable. Called when it is destroyed. No-op.
   * @ignore
   */
  disconnect() {}
}
