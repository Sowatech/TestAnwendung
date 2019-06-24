import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LoggerService } from '../../utilities/logger.service';
import { GenericEditDialogComponent } from './swt-generic-edit-dialog.component';
import { DialogFieldCategory, DialogField, DialogDynamicList } from './swt-generic-edit-dialog.types';
import { Subject,Subscription } from 'rxjs';

const CLASS = "GenericEditDialogService";

@Injectable()
export class GenericEditDialogService {

  constructor(private loggerService: LoggerService) {
  }

   private notify = new Subject<any>();
	public raiseNotify(data: any) {
		this.loggerService.log(CLASS + ".raiseNotify");
		this.notify.next(data);
	}

	private notifySubscriptions = new Array<Subscription>();
	public subscribeOnNotify(next: (value:any)=>void) {
		this.unsubscribeNotifies();
		this.notifySubscriptions.push(
			this.notify.subscribe(next)
		);
	}

	private unsubscribeNotifies() {
		for (let sub of this.notifySubscriptions) {
			sub.unsubscribe();
		}
	}
	
  private registeredConfigurations = new Array<DialogConfiguration>();

  private dialogComponent: GenericEditDialogComponent<any>;
  public setDialogComponent(dialogComponent: GenericEditDialogComponent<any>) {
    this.dialogComponent = dialogComponent;
  }

  public registerDialogConfiguration(key: string, dialogConfiguration: IDialogConfiguration);
  public registerDialogConfiguration(key: string, fieldsOrCategoriesOfFields: DialogField[] | DialogFieldCategory[], title?: string, categoriesAsTabs?: boolean);
  public registerDialogConfiguration(key: string, arg2: any, title?: string, categoriesAsTabs?: boolean) {
    let dialogConfiguration: IDialogConfiguration;
    if (arg2["fieldsOrCategoriesOfFields"] == undefined) {
      let fieldsOrCategoriesOfFields = arg2;
      let useTabs = categoriesAsTabs == true;
      dialogConfiguration = new DialogConfiguration(fieldsOrCategoriesOfFields, title, useTabs);
    }
    else {
      dialogConfiguration = arg2;
    }
    this.registeredConfigurations[key] = dialogConfiguration;
  }

  private getDialogConfiguration(key: string): DialogConfiguration {
    if (this.registeredConfigurations[key] == undefined) this.loggerService.error("the requested dialog configuration with key=" + key + " is not registered");
    return this.registeredConfigurations[key];
  }

  public show(configuration: IDialogConfiguration, dto?: any, mode?: any, lookups?: DialogDynamicList[]): Observable<GenericEditDialogResult<any, any>>;
  public show<DATATYPE>(configuration: IDialogConfiguration, dto?: DATATYPE, mode?: any, lookups?: DialogDynamicList[]): Observable<GenericEditDialogResult<DATATYPE, any>>;
  public show<DATATYPE, MODETYPE>(configuration: IDialogConfiguration, dto?: DATATYPE, mode?: MODETYPE, lookups?: DialogDynamicList[]): Observable<GenericEditDialogResult<DATATYPE, MODETYPE>>;
  public show(key: string, dto?: any, mode?: any, lookups?: DialogDynamicList[]): Observable<GenericEditDialogResult<any, any>>;
  public show<DATATYPE>(key: string, dto?: DATATYPE, mode?: any, lookups?: DialogDynamicList[]): Observable<GenericEditDialogResult<DATATYPE, any>>;
  public show<DATATYPE, MODETYPE>(key: string, dto?: DATATYPE, mode?: MODETYPE, lookups?: DialogDynamicList[]): Observable<GenericEditDialogResult<DATATYPE, MODETYPE>>;
  show<DATATYPE, MODETYPE>(arg1: string | DialogConfiguration, dto?: DATATYPE, mode?: MODETYPE, lookups?: DialogDynamicList[]): Observable<GenericEditDialogResult<DATATYPE, MODETYPE>> {
    let key: string = "";
    let configuration: IDialogConfiguration;
    if (typeof (arg1) == "string") {
      key = arg1;
      configuration = this.getDialogConfiguration(key);
    }
    else {
      configuration = arg1;
    }

    if (!this.dialogComponent) this.loggerService.error("No GenericEditDialogComponent provided. Put a GenericEditDialogComponent to the main view and call the setDialogComponent-method ");
    this.dialogComponent.onSubmit.observers = [];
    this.dialogComponent.titleSingular = configuration.title;
    this.dialogComponent.categoriesAsTabs = configuration.categoriesAsTabs;
    this.dialogComponent.size = configuration.size;
    this.dialogComponent.configureDialogFields(configuration.fieldsOrCategoriesOfFields);
    this.dialogComponent.show(dto, mode, lookups);
    return this.dialogComponent.onSubmit
      .map((dto: DATATYPE) => {
        return {
          key: key,
          dto: dto,
          mode: mode,
          submitResult: this.dialogComponent.submitResult
        }
      })
      .do((result: GenericEditDialogResult<DATATYPE, MODETYPE>) => {
        this.dialogComponent.hide();
      })
      ;
  }

  public hide() {
    this.dialogComponent.hide();
  }

  public showErrors(errors: string[]) {
    this.dialogComponent.showErrors(errors);
  }
}

export interface IDialogConfiguration {
  fieldsOrCategoriesOfFields: DialogField[] | DialogFieldCategory[];
  title: string;
  categoriesAsTabs?: boolean;
  size?: DialogSize;
}

class DialogConfiguration implements IDialogConfiguration {
  constructor(
    fieldsOrCategoriesOfFields: DialogField[] | DialogFieldCategory[],
    title?: string,
    categoriesAsTabs?: boolean,
    size?: DialogSize
  ) {
    this.fieldsOrCategoriesOfFields = fieldsOrCategoriesOfFields;
    this.title = title;
    this.categoriesAsTabs = categoriesAsTabs ? true : false;
    this.size = size;
  }

  fieldsOrCategoriesOfFields: DialogField[] | DialogFieldCategory[];
  title: string;
  categoriesAsTabs?: boolean;
  size?: DialogSize;
}

export type DialogSize = "small" | "medium" | "large";

//DATATYPE: the type of the data object to be edited by the dialog
//MODETYPE: optional "mode"-type of multi-purpose dialogs, e.g. "'CREATE'|'UPDATE'"
//submitResult: "OK","CANCEL" or CustomResult if using custom buttons
export class GenericEditDialogResult<DATATYPE, MODETYPE> {
  key: string;
  dto: DATATYPE;
  mode: MODETYPE;
  submitResult: string;
}
