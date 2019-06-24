import { NgModule } from '@angular/core';
import { masterDataRouting } from './master-data.routing';
import { MasterDataWebApiService } from './master-data-web-api.service';
import { MasterDataCategoryComponent} from './master-data.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [SharedModule, masterDataRouting],
    declarations: [MasterDataCategoryComponent],
    providers: [MasterDataWebApiService]
})
export class MasterDataModule { }