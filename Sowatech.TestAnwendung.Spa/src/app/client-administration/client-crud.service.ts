import { Injectable, EventEmitter } from '@angular/core';
import { LoggerService, MessageBoxService, MessageType, MessageButtons, GenericEditDialogService, Session } from '../shared';
import { InsertClientDto, UpdateClientDto, InsertResult } from './client.dtos';
import { ClientWebApiService } from "./client-web-api.service";

@Injectable()
export class ClientCrudService {
    constructor(
        private session: Session,
        private logger: LoggerService,
        private wepApiService: ClientWebApiService,
        private messageBoxService: MessageBoxService,
        private genericEditDialogService: GenericEditDialogService
    ) { }

    public createItem() {
        this.logger.log("ClientCrudService.createItem");
        this.showCreateItemDialog();
    }

    private showCreateItemDialog() {
        this.genericEditDialogService.show<InsertClientDto, EditModeType>("CLIENT_ADD", null, "CREATE")
            .subscribe((result) => {
                this.onCreateDialogOkButton(result.dto);
            });
    }

    private async onCreateDialogOkButton(dto: InsertClientDto) {
        try {
            let insertResult: InsertResult = await this.wepApiService.insert(<InsertClientDto>dto);
            if (insertResult.identityResult.Succeeded) {
                this.logger.log("ClientCrudService.onCreateDialogOkButton/" + "CREATE" + "/success");
                this.onCrudSuccess.emit({ mode: "CREATE", itemId: insertResult.clientId });
            }
            else {
                this.logger.log("ClientCrudService.onCreateDialogOkButton/" + "CREATE" + "/not succeeded");
                this.genericEditDialogService.showErrors(insertResult.identityResult.Errors);
            }
        }
        catch (error) {
            this.serverSaveError(error);
        }
    }

    public async editItem(itemId: number) {
        this.logger.log("ClientCrudService.editItem");
        try {
            let data = await this.wepApiService.getUpdate(itemId);
            this.showEditItemDialog(data);
        }
        catch (error) {
            this.serverLoadError(error);
        }
    }

    private showEditItemDialog(data: UpdateClientDto) {
        this.genericEditDialogService.show<UpdateClientDto, EditModeType>("CLIENT", data, "UPDATE")
            .subscribe((result) => {
                this.onEditDialogOkButton(result.dto);
            });
    }

    private async onEditDialogOkButton(dto: UpdateClientDto) {
        try {
            await this.wepApiService.update(<UpdateClientDto>dto);
            this.logger.log("ClientCrudService.onEditDialogOkButton/" + "UPDATE" + "/success");
            this.onCrudSuccess.emit({ mode: "UPDATE", itemId: (<UpdateClientDto>dto).id });
        }
        catch (error) {
            this.serverSaveError(error);
        }
    }

    public onCrudSuccess = new EventEmitter<CrudSuccessResult>();


    public deleteItemConfirmation(itemId: number, itemName: string) {
        this.logger.log("ClientCrudService.deleteItemConfirmation");
        this.messageBoxService.confirmDialog(ENTITY_SINGULAR + ` "${itemName}" löschen?`, "Löschen")
            .then(() => { this.deleteItem(itemId); });
    }

    private async deleteItem(itemId: number) {
        this.logger.log("ClientCrudService.deleteItem");
        try {
            await this.wepApiService.deleteClient(itemId);
            this.logger.log("ClientCrudService.deleteItem/success");
            this.onCrudSuccess.emit({ mode: "DELETE", itemId: itemId });
        }
        catch (error) {
            this.serverSaveError(error)
        }
    }

    private serverLoadError(error) {
        this.logger.error(error);
        this.messageBoxService.showDialog("Fehler beim Laden der Daten vom Server", "Fehler", MessageType.ERROR, MessageButtons.CLOSE);
    }

    private serverSaveError(error) {
        this.logger.error(error);
        this.messageBoxService.showDialog("Fehler beim Speichern der Daten auf dem Server", "Fehler", MessageType.ERROR, MessageButtons.CLOSE);
    }
}

const ENTITY_SINGULAR = "Mandant";

export type EditModeType = "CREATE" | "UPDATE";
export type CrudModeType = EditModeType | "DELETE";

export class CrudSuccessResult {
    mode: CrudModeType;
    itemId: number;
}

