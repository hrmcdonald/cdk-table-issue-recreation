import { MtrSortModule, MtrSortHeader, MtrSort } from '@mortar/angular/components/atomic/sort';
import { MtrPaginatorModule, MtrPaginator } from '@mortar/angular/components/atomic/paginator';
import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  flush,
  flushMicrotasks,
  TestBed,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Observable } from 'rxjs';
import { MtrTableModule } from './index';
import { MtrTable } from './table';
import { MtrTableDataSource } from './table-data-source';
import { take } from 'rxjs/operators';

describe('MtrTable', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MtrTableModule, MtrPaginatorModule, MtrSortModule, NoopAnimationsModule],
      declarations: [
        MtrTableApp,
        MtrTableWithWhenRowApp,
        ArrayDataSourceMtrTableApp,
        NativeHtmlTableApp,
        MtrTableWithSortApp,
        MtrTableWithPaginatorApp,
        StickyTableApp,
        TableWithNgContainerRow,
      ],
    }).compileComponents();
  }));

  describe('with basic data source', () => {
    it('should be able to create a table with the right content and without when row', () => {
      let fixture = TestBed.createComponent(MtrTableApp);
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('.mtr-table')!;
      const data = fixture.componentInstance.dataSource!.data;
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [data[0].a, data[0].b, data[0].c],
        [data[1].a, data[1].b, data[1].c],
        [data[2].a, data[2].b, data[2].c],
        ['fourth_row'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should create a table with special when row', () => {
      let fixture = TestBed.createComponent(MtrTableWithWhenRowApp);
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('.mtr-table');
      expectTableToMatchContent(tableElement, [
        ['Column A'],
        ['a_1'],
        ['a_2'],
        ['a_3'],
        ['fourth_row'],
        ['Footer A'],
      ]);
    });

    it('should create a table with multiTemplateDataRows true', () => {
      let fixture = TestBed.createComponent(MtrTableWithWhenRowApp);
      fixture.componentInstance.multiTemplateDataRows = true;
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('.mtr-table');
      expectTableToMatchContent(tableElement, [
        ['Column A'],
        ['a_1'],
        ['a_2'],
        ['a_3'],
        ['a_4'], // With multiple rows, this row shows up along with the special 'when' fourth_row
        ['fourth_row'],
        ['Footer A'],
      ]);
    });
  });

  it('should be able to render a table correctly with native elements', () => {
    let fixture = TestBed.createComponent(NativeHtmlTableApp);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('table');
    const data = fixture.componentInstance.dataSource!.data;
    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      [data[0].a, data[0].b, data[0].c],
      [data[1].a, data[1].b, data[1].c],
      [data[2].a, data[2].b, data[2].c],
      [data[3].a, data[3].b, data[3].c],
    ]);
  });

  it('should render with MtrTableDataSource and sort', () => {
    let fixture = TestBed.createComponent(MtrTableWithSortApp);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('.mtr-table')!;
    const data = fixture.componentInstance.dataSource!.data;
    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      [data[0].a, data[0].b, data[0].c],
      [data[1].a, data[1].b, data[1].c],
      [data[2].a, data[2].b, data[2].c],
    ]);
  });

  it('should render with MtrTableDataSource and pagination', () => {
    let fixture = TestBed.createComponent(MtrTableWithPaginatorApp);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('.mtr-table')!;
    const data = fixture.componentInstance.dataSource!.data;
    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      [data[0].a, data[0].b, data[0].c],
      [data[1].a, data[1].b, data[1].c],
      [data[2].a, data[2].b, data[2].c],
    ]);
  });

  it('should be configured by the mtr-table-container', () => {
    let fixture = TestBed.createComponent(MtrTableWithPaginatorApp);
    fixture.detectChanges();
    const paginator = fixture.componentInstance.dataSource!.paginator;
    expect(paginator).not.toBeNull();
  });

  it('should be reconfigured by the mtr-table-container when paginator changes', () => {
    let fixture = TestBed.createComponent(MtrTableWithPaginatorApp);
    fixture.detectChanges();
    const paginator = fixture.componentInstance.dataSource!.paginator;
    expect(paginator).not.toBeNull();
    expect(paginator.pageSize).toBe(5);

    fixture.componentInstance.useFirstPaginator = false;
    fixture.detectChanges();

    const secondPaginator = fixture.componentInstance.dataSource!.paginator;
    expect(secondPaginator).not.toBeNull();
    expect(secondPaginator.pageSize).toBe(10);
  });

  it('should apply custom sticky CSS class to sticky cells', () => {
    let fixture = TestBed.createComponent(StickyTableApp);
    fixture.detectChanges();

    const stuckCellElement = fixture.nativeElement.querySelector('.mtr-table th')!;
    expect(stuckCellElement.classList).toContain('mtr-table--sticky');
  });

  // Note: needs to be fakeAsync so it catches the error.
  it('should not throw when a row definition is on an ng-container', fakeAsync(() => {
    const fixture = TestBed.createComponent(TableWithNgContainerRow);

    expect(() => {
      fixture.detectChanges();
      tick();
    }).not.toThrow();
  }));

  describe('with MtrTableDataSource and sort/pagination/filter', () => {
    let tableElement: HTMLElement;
    let fixture: ComponentFixture<ArrayDataSourceMtrTableApp>;
    let dataSource: MtrTableDataSource<TestData>;
    let component: ArrayDataSourceMtrTableApp;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(ArrayDataSourceMtrTableApp);
      fixture.detectChanges();
      tick();

      tableElement = fixture.nativeElement.querySelector('.mtr-table');
      component = fixture.componentInstance;
      dataSource = fixture.componentInstance.dataSource;
    }));

    it('should create table and display data source contents', () => {
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('changing data should update the table contents', () => {
      // Add data
      component.underlyingDataSource.addData();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['a_4', 'b_4', 'c_4'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Remove data
      const modifiedData = dataSource.data.slice();
      modifiedData.shift();
      dataSource.data = modifiedData;
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['a_4', 'b_4', 'c_4'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    // tslint:disable-next-line: max-line-length
    it('should update the page index when switching to a smaller data set from a page', fakeAsync(() => {
      // Add 20 rows so we can switch pages.
      for (let i = 0; i < 20; i++) {
        component.underlyingDataSource.addData();
        fixture.detectChanges();
        tick();
      }

      // Go to the last page.
      fixture.componentInstance.paginator.lastPage();
      fixture.detectChanges();
      tick();

      // Switch to a smaller data set.
      dataSource.data = [{ a: 'a_0', b: 'b_0', c: 'c_0' }];
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_0', 'b_0', 'c_0'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    }));

    it('should be able to filter the table contents', fakeAsync(() => {
      // Change filter to a_1, should match one row
      dataSource.filterGlobal('a_1');
      fixture.detectChanges();
      dataSource.filteredData$.pipe(take(1)).subscribe((filteredData) => {
        expect(filteredData.length).toBe(1);
        expect(filteredData[0]).toBe(dataSource.data[0]);
      });
      tick();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      flushMicrotasks(); // Resolve promise that updates paginator's length
      expect(dataSource.paginator!.totalItems).toBe(1);

      // Change filter to '  A_2  ', should match one row (ignores case and whitespace)
      dataSource.filterGlobal('A_2');
      fixture.detectChanges();
      dataSource.filteredData$.pipe(take(1)).subscribe((filteredData) => {
        expect(filteredData.length).toBe(1);
        expect(filteredData[0]).toBe(dataSource.data[1]);
      });
      tick();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_2', 'b_2', 'c_2'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Change filter to empty string, should match all rows
      dataSource.filterGlobal('');
      fixture.detectChanges();
      dataSource.filteredData$.pipe(take(1)).subscribe((filteredData) => {
        expect(filteredData.length).toBe(3);
        expect(filteredData[0]).toBe(dataSource.data[0]);
        expect(filteredData[1]).toBe(dataSource.data[1]);
        expect(filteredData[2]).toBe(dataSource.data[2]);
      });
      tick();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Change filter function and filter, should match to rows with zebra.
      dataSource.filterPredicate = (data, filter) => {
        let dataStr;
        switch (data.a) {
          case 'a_1':
            dataStr = 'elephant';
            break;
          case 'a_2':
            dataStr = 'zebra';
            break;
          case 'a_3':
            dataStr = 'monkey';
            break;
          default:
            dataStr = '';
        }

        return dataStr.indexOf(filter) !== -1;
      };
      dataSource.filterGlobal('zebra');
      fixture.detectChanges();
      tick();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_2', 'b_2', 'c_2'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    }));

    it('should not match concatenated words', fakeAsync(() => {
      // Set the value to the last character of the first
      // column plus the first character of the second column.
      dataSource.filterGlobal('1b');
      fixture.detectChanges();
      tick();
      dataSource.filteredData$.pipe(take(1)).subscribe((filteredData) => {
        expect(filteredData.length).toBe(0);
      });
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    }));

    it('should be able to sort the table contents', () => {
      // Activate column A sort
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Activate column A sort again (reverse direction)
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_3', 'b_3', 'c_3'],
        ['a_2', 'b_2', 'c_2'],
        ['a_1', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Change sort function to customize how it sorts - first column 1, then 3, then 2
      dataSource.sortingDataAccessor = (data) => {
        switch (data.a) {
          case 'a_1':
            return 'elephant';
          case 'a_2':
            return 'zebra';
          case 'a_3':
            return 'monkey';
          default:
            return '';
        }
      };
      component.sort.direction = '';
      component.sort.sort(component.sortHeader);
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_3', 'b_3', 'c_3'],
        ['a_2', 'b_2', 'c_2'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should by default correctly sort an empty string', () => {
      // Activate column A sort
      dataSource.data[0].a = ' ';
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();

      // Expect that empty string row comes before the other values
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Expect that empty string row comes before the other values
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_3', 'b_3', 'c_3'],
        ['a_2', 'b_2', 'c_2'],
        ['', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should by default correctly sort undefined values', () => {
      // Activate column A sort
      dataSource.data[0].a = undefined;

      // Expect that undefined row comes before the other values
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Expect that undefined row comes after the other values
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_3', 'b_3', 'c_3'],
        ['a_2', 'b_2', 'c_2'],
        ['', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should sort zero correctly', () => {
      // Activate column A sort
      dataSource.data[0].a = 1;
      dataSource.data[1].a = 0;
      dataSource.data[2].a = -1;

      // Expect that zero comes after the negative numbers and before the positive ones.
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['-1', 'b_3', 'c_3'],
        ['0', 'b_2', 'c_2'],
        ['1', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Expect that zero comes after the negative numbers and before
      // the positive ones when switching the sorting direction.
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['1', 'b_1', 'c_1'],
        ['0', 'b_2', 'c_2'],
        ['-1', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should be able to page the table contents', fakeAsync(() => {
      // Add 100 rows, should only display first 5 since page length is 5
      for (let i = 0; i < 100; i++) {
        component.underlyingDataSource.addData();
      }
      fixture.detectChanges();
      tick();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['a_4', 'b_4', 'c_4'],
        ['a_5', 'b_5', 'c_5'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Navigate to the next page
      component.paginator.nextPage();
      fixture.detectChanges();
      tick();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_6', 'b_6', 'c_6'],
        ['a_7', 'b_7', 'c_7'],
        ['a_8', 'b_8', 'c_8'],
        ['a_9', 'b_9', 'c_9'],
        ['a_10', 'b_10', 'c_10'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    }));

    it('should sort strings with numbers larger than MAX_SAFE_INTEGER correctly', () => {
      const large = '9563256840123535';
      const larger = '9563256840123536';
      const largest = '9563256840123537';

      dataSource.data[0].a = largest;
      dataSource.data[1].a = larger;
      dataSource.data[2].a = large;

      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [large, 'b_3', 'c_3'],
        [larger, 'b_2', 'c_2'],
        [largest, 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [largest, 'b_1', 'c_1'],
        [larger, 'b_2', 'c_2'],
        [large, 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });
  });
});

interface TestData {
  a: string | number | undefined;
  b: string | number | undefined;
  c: string | number | undefined;
}

class FakeDataSource extends DataSource<TestData> {
  _dataChange = new BehaviorSubject<TestData[]>([]);
  get data() {
    return this._dataChange.getValue();
  }
  set data(data: TestData[]) {
    this._dataChange.next(data);
  }

  constructor() {
    super();
    for (let i = 0; i < 4; i++) {
      this.addData();
    }
  }

  connect(): Observable<TestData[]> {
    return this._dataChange;
  }

  disconnect() {}

  addData() {
    const nextIndex = this.data.length + 1;

    let copiedData = this.data.slice();
    copiedData.push({
      a: `a_${nextIndex}`,
      b: `b_${nextIndex}`,
      c: `c_${nextIndex}`,
    });

    this.data = copiedData;
  }
}

@Component({
  template: `
    <table mtr-table [dataSource]="dataSource">
      <ng-container mtrColumnDef="column_a">
        <th mtr-header-cell *mtrHeaderCellDef>Column A</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.a }}</td>
        <td mtr-footer-cell *mtrFooterCellDef>Footer A</td>
      </ng-container>

      <ng-container mtrColumnDef="column_b">
        <th mtr-header-cell *mtrHeaderCellDef>Column B</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.b }}</td>
        <td mtr-footer-cell *mtrFooterCellDef>Footer B</td>
      </ng-container>

      <ng-container mtrColumnDef="column_c">
        <th mtr-header-cell *mtrHeaderCellDef>Column C</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.c }}</td>
        <td mtr-footer-cell *mtrFooterCellDef>Footer C</td>
      </ng-container>

      <ng-container mtrColumnDef="special_column">
        <td mtr-cell *mtrCellDef="let row">fourth_row</td>
      </ng-container>

      <tr mtr-header-row *mtrHeaderRowDef="columnsToRender"></tr>
      <tr mtr-row *mtrRowDef="let row; columns: columnsToRender"></tr>
      <tr mtr-row *mtrRowDef="let row; columns: ['special_column']; when: isFourthRow"></tr>
      <tr mtr-footer-row *mtrFooterRowDef="columnsToRender"></tr>
    </table>
  `,
})
class MtrTableApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
  isFourthRow = (i: number, _rowData: TestData) => i === 3;

  @ViewChild(MtrTable, { static: true }) table: MtrTable<TestData>;
}

@Component({
  template: `
    <table mtr-table [dataSource]="dataSource">
      <ng-container mtrColumnDef="column_a">
        <th mtr-header-cell *mtrHeaderCellDef>Column A</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.a }}</td>
      </ng-container>

      <ng-container mtrColumnDef="column_b">
        <th mtr-header-cell *mtrHeaderCellDef>Column B</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.b }}</td>
      </ng-container>

      <ng-container mtrColumnDef="column_c">
        <th mtr-header-cell *mtrHeaderCellDef>Column C</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.c }}</td>
      </ng-container>

      <tr mtr-header-row *mtrHeaderRowDef="columnsToRender"></tr>
      <tr mtr-row *mtrRowDef="let row; columns: columnsToRender"></tr>
    </table>
  `,
})
class NativeHtmlTableApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MtrTable, { static: true }) table: MtrTable<TestData>;
}

@Component({
  template: `
    <table mtr-table [dataSource]="dataSource">
      <ng-container mtrColumnDef="column_a">
        <th mtr-header-cell *mtrHeaderCellDef>Column A</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.a }}</td>
      </ng-container>

      <tr mtr-header-row *mtrHeaderRowDef="columnsToRender; sticky: true"></tr>
      <tr mtr-row *mtrRowDef="let row; columns: columnsToRender"></tr>
    </table>
  `,
})
class StickyTableApp {
  dataSource = new FakeDataSource();
  columnsToRender = ['column_a'];

  @ViewChild(MtrTable, { static: true }) table: MtrTable<TestData>;
}

@Component({
  template: `
    <table mtr-table [dataSource]="dataSource" [multiTemplateDataRows]="multiTemplateDataRows">
      <ng-container mtrColumnDef="column_a">
        <th mtr-header-cell *mtrHeaderCellDef>Column A</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.a }}</td>
        <td mtr-footer-cell *mtrFooterCellDef>Footer A</td>
      </ng-container>

      <ng-container mtrColumnDef="special_column">
        <td mtr-cell *mtrCellDef="let row">fourth_row</td>
      </ng-container>

      <tr mtr-header-row *mtrHeaderRowDef="['column_a']"></tr>
      <tr mtr-row *mtrRowDef="let row; columns: ['column_a']"></tr>
      <tr mtr-row *mtrRowDef="let row; columns: ['special_column']; when: isFourthRow"></tr>
      <tr mtr-footer-row *mtrFooterRowDef="['column_a']"></tr>
    </table>
  `,
})
class MtrTableWithWhenRowApp {
  multiTemplateDataRows = false;
  dataSource: FakeDataSource | null = new FakeDataSource();
  isFourthRow = (i: number, _rowData: TestData) => i === 3;

  @ViewChild(MtrTable, { static: false }) table: MtrTable<TestData>;
}

@Component({
  template: `
    <mtr-table-container>
      <table mtr-table [dataSource]="dataSource" mtrSort>
        <ng-container mtrColumnDef="column_a">
          <th mtr-header-cell *mtrHeaderCellDef mtr-sort-header="a">Column A</th>
          <td mtr-cell *mtrCellDef="let row">{{ row.a }}</td>
          <td mtr-footer-cell *mtrFooterCellDef>Footer A</td>
        </ng-container>

        <ng-container mtrColumnDef="column_b">
          <th mtr-header-cell *mtrHeaderCellDef>Column B</th>
          <td mtr-cell *mtrCellDef="let row">{{ row.b }}</td>
          <td mtr-footer-cell *mtrFooterCellDef>Footer B</td>
        </ng-container>

        <ng-container mtrColumnDef="column_c">
          <th mtr-header-cell *mtrHeaderCellDef>Column C</th>
          <td mtr-cell *mtrCellDef="let row">{{ row.c }}</td>
          <td mtr-footer-cell *mtrFooterCellDef>Footer C</td>
        </ng-container>

        <tr mtr-header-row *mtrHeaderRowDef="columnsToRender"></tr>
        <tr mtr-row *mtrRowDef="let row; columns: columnsToRender"></tr>
        <tr mtr-footer-row *mtrFooterRowDef="columnsToRender"></tr>
      </table>

      <mtr-paginator [pageSize]="5"></mtr-paginator>
    </mtr-table-container>
  `,
})
class ArrayDataSourceMtrTableApp implements AfterViewInit {
  underlyingDataSource = new FakeDataSource();
  dataSource = new MtrTableDataSource<TestData>();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MtrTable, { static: true }) table: MtrTable<TestData>;
  @ViewChild(MtrPaginator, { static: true }) paginator: MtrPaginator;
  @ViewChild(MtrSort, { static: true }) sort: MtrSort;
  @ViewChild(MtrSortHeader, { static: false }) sortHeader: MtrSortHeader;

  constructor() {
    this.underlyingDataSource.data = [];

    // Add three rows of data
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();

    this.underlyingDataSource.connect().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}

@Component({
  template: `
    <table mtr-table [dataSource]="dataSource" mtrSort>
      <ng-container mtrColumnDef="column_a">
        <th mtr-header-cell *mtrHeaderCellDef mtr-sort-header="a">Column A</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.a }}</td>
      </ng-container>

      <ng-container mtrColumnDef="column_b">
        <th mtr-header-cell *mtrHeaderCellDef>Column B</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.b }}</td>
      </ng-container>

      <ng-container mtrColumnDef="column_c">
        <th mtr-header-cell *mtrHeaderCellDef>Column C</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.c }}</td>
      </ng-container>

      <tr mtr-header-row *mtrHeaderRowDef="columnsToRender"></tr>
      <tr mtr-row *mtrRowDef="let row; columns: columnsToRender"></tr>
    </table>
  `,
})
class MtrTableWithSortApp implements OnInit {
  underlyingDataSource = new FakeDataSource();
  dataSource = new MtrTableDataSource<TestData>();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MtrTable, { static: true }) table: MtrTable<TestData>;
  @ViewChild(MtrSort, { static: true }) sort: MtrSort;

  constructor() {
    this.underlyingDataSource.data = [];

    // Add three rows of data
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();

    this.underlyingDataSource.connect().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    this.dataSource!.sort = this.sort;
  }
}

@Component({
  template: `
    <mtr-table-container>
      <table mtr-table [dataSource]="dataSource">
        <ng-container mtrColumnDef="column_a">
          <th mtr-header-cell *mtrHeaderCellDef>Column A</th>
          <td mtr-cell *mtrCellDef="let row">{{ row.a }}</td>
        </ng-container>

        <ng-container mtrColumnDef="column_b">
          <th mtr-header-cell *mtrHeaderCellDef>Column B</th>
          <td mtr-cell *mtrCellDef="let row">{{ row.b }}</td>
        </ng-container>

        <ng-container mtrColumnDef="column_c">
          <th mtr-header-cell *mtrHeaderCellDef>Column C</th>
          <td mtr-cell *mtrCellDef="let row">{{ row.c }}</td>
        </ng-container>

        <tr mtr-header-row *mtrHeaderRowDef="columnsToRender"></tr>
        <tr mtr-row *mtrRowDef="let row; columns: columnsToRender"></tr>
      </table>

      <mtr-paginator *ngIf="useFirstPaginator" [pageSize]="5"></mtr-paginator>
      <mtr-paginator *ngIf="!useFirstPaginator" [pageSize]="10"></mtr-paginator>
    </mtr-table-container>
  `,
})
class MtrTableWithPaginatorApp {
  underlyingDataSource = new FakeDataSource();
  dataSource = new MtrTableDataSource<TestData>();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  useFirstPaginator = true;

  @ViewChild(MtrTable, { static: true }) table: MtrTable<TestData>;

  constructor() {
    this.underlyingDataSource.data = [];

    // Add three rows of data
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();

    this.underlyingDataSource.connect().subscribe((data) => {
      this.dataSource.data = data;
    });
  }
}

@Component({
  template: `
    <table mtr-table [dataSource]="dataSource">
      <ng-container mtrColumnDef="column_a">
        <th mtr-header-cell *mtrHeaderCellDef>Column A</th>
        <td mtr-cell *mtrCellDef="let row">{{ row.a }}</td>
      </ng-container>

      <th mtr-header-row *mtrHeaderRowDef="columnsToRender"></th>
      <ng-container *mtrRowDef="let row; columns: columnsToRender">
        <tr mtr-row></tr>
      </ng-container>
    </table>
  `,
})
class TableWithNgContainerRow {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a'];
}

function getElements(element: Element, query: string): Element[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRows(tableElement: Element): Element[] {
  return [].slice.call(tableElement.querySelectorAll('.mtr-row--header'))!;
}

function getFooterRows(tableElement: Element): Element[] {
  return [].slice.call(tableElement.querySelectorAll('.mtr-row--footer'))!;
}

function getRows(tableElement: Element): Element[] {
  return getElements(tableElement, '.mtr-row');
}

function getCells(row: Element): Element[] {
  if (!row) {
    return [];
  }

  let cells = getElements(row, 'mtr-cell');
  if (!cells.length) {
    cells = getElements(row, 'td');
  }

  return cells;
}

function getHeaderCells(headerRow: Element): Element[] {
  let cells = getElements(headerRow, 'mtr-cell--header');
  if (!cells.length) {
    cells = getElements(headerRow, 'th');
  }

  return cells;
}

function getFooterCells(footerRow: Element): Element[] {
  let cells = getElements(footerRow, 'mtr-cell--footer');
  if (!cells.length) {
    cells = getElements(footerRow, 'td');
  }

  return cells;
}

function getActualTableContent(tableElement: Element): string[][] {
  let actualTableContent: Element[][] = [];
  getHeaderRows(tableElement).forEach((row) => {
    actualTableContent.push(getHeaderCells(row));
  });

  // Check data row cells
  const rows = getRows(tableElement).map((row) => getCells(row));
  actualTableContent = actualTableContent.concat(rows);

  getFooterRows(tableElement).forEach((row) => {
    actualTableContent.push(getFooterCells(row));
  });

  // Convert the nodes into their text content;
  return actualTableContent.map((row) => row.map((cell) => cell.textContent!.trim()));
}

export function expectTableToMatchContent(tableElement: Element, expected: any[]) {
  const missedExpectations: string[] = [];
  function checkCellContent(actualCell: string, expectedCell: string) {
    if (actualCell !== expectedCell) {
      missedExpectations.push(`Expected cell contents to be ${expectedCell} but was ${actualCell}`);
    }
  }

  const actual = getActualTableContent(tableElement);

  // Make sure the number of rows match
  if (actual.length !== expected.length) {
    missedExpectations.push(`Expected ${expected.length} total rows but got ${actual.length}`);
    fail(missedExpectations.join('\n'));
  }

  actual.forEach((row, rowIndex) => {
    const expectedRow = expected[rowIndex];

    // Make sure the number of cells match
    if (row.length !== expectedRow.length) {
      missedExpectations.push(`Expected ${expectedRow.length} cells in row but got ${row.length}`);
      fail(missedExpectations.join('\n'));
    }

    row.forEach((actualCell, cellIndex) => {
      const expectedCell = expectedRow ? expectedRow[cellIndex] : null;
      checkCellContent(actualCell, expectedCell);
    });
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}
