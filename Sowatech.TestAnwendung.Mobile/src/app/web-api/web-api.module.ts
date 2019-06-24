import { NgModule } from '@angular/core';
import { IWebApiServiceRequestBuilder } from './http-request-builder';
import { WebApiServiceWithTan } from './web-api-with-tan.service';
import { WebApiServiceWithToken } from './web-api-with-token.service';
import { WebApiServiceWithoutAuth } from './web-api-without-auth.service';
import { WebApiSettingsService } from './web-api-settings.service';

export { IWebApiServiceRequestBuilder } from './http-request-builder';
export { WebApiServiceWithTan } from './web-api-with-tan.service';
export { WebApiServiceWithToken } from './web-api-with-token.service';
export { WebApiServiceWithoutAuth } from './web-api-without-auth.service';
export { WebApiSettingsService } from './web-api-settings.service';

@NgModule({
    providers: []
})
export class WebApiModule {}