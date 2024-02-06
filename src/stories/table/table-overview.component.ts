import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MtrTableModule } from '@mortar/angular/components/atomic/table';

@Component({
  selector: 'ex-table-overview',
  template: `
    <mtr-table-container [width]="800">
      <table mtr-table [dataSource]="dataSource">
        <!--- Column definitions below do not define render order.
              These are simply template definitions -->

        <!-- Position Column -->
        <ng-container mtrColumnDef="position">
          <th mtr-header-cell *mtrHeaderCellDef>No.</th>
          <td mtr-cell *mtrCellDef="let element">{{ element.position }}</td>
        </ng-container>

        <!-- Name Column -->
        <ng-container mtrColumnDef="name">
          <th mtr-header-cell *mtrHeaderCellDef>Name</th>
          <td mtr-cell *mtrCellDef="let element">{{ element.name }}</td>
        </ng-container>

        <!-- Weight Column -->
        <ng-container mtrColumnDef="weight">
          <th mtr-header-cell *mtrHeaderCellDef>Weight</th>
          <td mtr-cell *mtrCellDef="let element">{{ element.weight }}</td>
        </ng-container>

        <!-- Symbol Column -->
        <ng-container mtrColumnDef="symbol">
          <th mtr-header-cell *mtrHeaderCellDef>Symbol</th>
          <td mtr-cell *mtrCellDef="let element">{{ element.symbol }}</td>
        </ng-container>

        <tr mtr-header-row *mtrHeaderRowDef="displayedColumns"></tr>
        <tr mtr-row *mtrRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </mtr-table-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MtrTableModule],
})
export class TableOverviewComponent {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = [
    { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
    { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
    { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
  ];
}
