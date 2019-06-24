import { Component, OnDestroy, OnInit } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Subscription';

import { GenericEditDialogService, LoggerService, MessageBoxService, Session, SessionDataDto } from '../../shared';
import { UserProfileWebApiService } from '../user-profile-web-api.service';
import { ChangePasswordParameters, IdentityResultDto, UpdateUserProfileDto } from '../user-profile.dtos';

@Component({
    selector: 'user-info',
    templateUrl: './user-info.component.html'
})

export class UserInfoComponent implements OnInit, OnDestroy {
    constructor(
        public translation: TranslationService,
        private logger: LoggerService,
        private session: Session,
        private userProfileWebApiService: UserProfileWebApiService,
        private messageBoxService: MessageBoxService,
        private genericEditDialogService: GenericEditDialogService
    ) {
    }

    @Language() lang: string;
    public userName: string = null;
    public displayName: string = null;

    private subscriptions = new Array<Subscription>();

    ngOnInit() {
        this.updateFromSession(this.session.Data);
        this.subscriptions.push(
            this.session.sessionChanged.subscribe((dto) => this.updateFromSession(dto))
        );
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    updateFromSession(sessionDataDto: SessionDataDto) {
        if (sessionDataDto) {
            this.userName = sessionDataDto.userName;
            this.displayName = sessionDataDto.displayName ? sessionDataDto.displayName : this.userName;
        }
        else {
            this.userName = null;
            this.displayName = null;
        }
    }

    public editPassword() {
        this.logger.log("UserInfoComponent.editPassword");
        this.genericEditDialogService.show<ChangePasswordParameters, void>("USER_CHANGE_PASSWORD").subscribe(
            (result) => { this.onEditPasswordDialogOkButton(result.dto); }
        )
    }

    private async onEditPasswordDialogOkButton(dto: ChangePasswordParameters) {
        try {
            let identityResult = await this.userProfileWebApiService.changePassword(dto)
            if (identityResult.Succeeded) {
                this.messageBoxService.infoDialog("Ihr Passwort wurde erfolgreich geändert");
            }
            else {
                this.genericEditDialogService.showErrors(identityResult.Errors);
            }
        }
        catch (error) {
            this.serverSaveError(error)
        }
    }

    public async editProfile() {
        this.logger.log("UserInfoComponent.editProfile");
        try {
            let dto = await this.userProfileWebApiService.getUpdateUserProfile();
            this.genericEditDialogService.show<UpdateUserProfileDto, void>("USER_PROFILE_UPDATE", dto).subscribe(
                (result) => { this.editProfileDialogOkButton(result.dto); }
            )
        }
        catch (error) {
            this.serverLoadError(error)
        }
    }

    private async editProfileDialogOkButton(dto: UpdateUserProfileDto) {
        try{
            let identityResultDto: IdentityResultDto = await this.userProfileWebApiService.updateUserProfile(dto);
            if (identityResultDto.Succeeded) {
                this.logger.log("UserCrudService.onOkUpdateUserDialog/Succeeded");
                let sessionData = this.session.Data;
                sessionData.displayName = dto.displayName;
                this.session.Data = sessionData;
            }
            else {
                this.logger.log("UserCrudService.onOkCreateUserDialog/Failed");
                this.genericEditDialogService.showErrors(identityResultDto.Errors);
            }
        }
        catch(error){
            this.serverSaveError(error)
        }
    }

    private serverLoadError(error: any) {
        this.logger.error(error);
        this.messageBoxService.errorDialog("Fehler beim Laden vom Servers");
    }

    private serverSaveError(error: any) {
        this.logger.error(error);
        this.messageBoxService.errorDialog("Fehler beim Speichern auf dem Server");
    }

}
