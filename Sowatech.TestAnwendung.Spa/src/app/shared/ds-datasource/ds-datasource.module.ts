import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatasourceComponent } from './ds-datasource.component';
import { DatasourceFilterDirective } from './ds-filter.directive';
import { DatasourceFilterdisplayComponent } from './ds-filterdisplay.component';
import { DatasourceFilterGroupComponent } from './ds-filter-group.component';
import { DatasourceSortDirective } from './ds-sort.directive';
import { DatasourcePaginationInfoComponent } from './ds-pagination-info.component';
import { DatasourcePaginationComponent } from './ds-pagination.component';
import { DatasourceSelectionCheckboxComponent } from './ds-selection-checkbox.component';

import { SortHelper } from './ds-sort-helper.service';
import { SelectionListHelper } from './ds-selection-list-helper.service';
import { PaginationHelper } from './ds-pagination-helper.service';
import { FilterHelper } from './ds-filter-helper.service';
import { RefreshParamsStoreHelper } from './ds-refreshparams-store.service';

//--- exports
export { DatasourceComponent } from './ds-datasource.component';
export { DatasourceSelectionCheckboxComponent } from './ds-selection-checkbox.component';
export { DatasourceFilterGroupComponent } from './ds-filter-group.component';
export { SortItem, FilterItem, FilterOperator, PaginationInfo, RefreshParams, RefreshResult, GroupConfiguration, GroupDataItem } from './ds-dtos.model';

@NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [DatasourceComponent,
        DatasourceFilterDirective,
        DatasourceFilterdisplayComponent,
        DatasourceFilterGroupComponent,
        DatasourceSortDirective,
        DatasourcePaginationInfoComponent,
        DatasourcePaginationComponent,
        DatasourceSelectionCheckboxComponent
    ],
    exports: [DatasourceComponent,
        DatasourceFilterDirective,
        DatasourceFilterdisplayComponent,
        DatasourceFilterGroupComponent,
        DatasourceSortDirective,
        DatasourcePaginationInfoComponent,
        DatasourcePaginationComponent,
        DatasourceSelectionCheckboxComponent
    ],
    //providers: [SortHelper, SelectionListHelper, PaginationHelper, FilterHelper, RefreshParamsStoreHelper]
})
export class DatasourceModule { }