import { Component, ViewChild } from '@angular/core';
import { Events, Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PouchDbService, RepositoryWithIdPrefix } from '../app/api';
import { DataSettingDto, DataImageGalleryDto } from './app.dto';
import * as Page from './pages';
import { Session } from './shared';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = Page.LoginPage;
    pages: Array<Page.PageModel>;
    isTestUser: boolean = false;

    constructor(
        public events: Events,
        public platform: Platform,
        public menu: MenuController,
        private session: Session,
        private statusBar: StatusBar,
        private splashScreen: SplashScreen,
        
        private pouchDbService: PouchDbService
    ) {
        this.initializeApp();
     
    }

    ngOnInit() {
        this.session.sessionChanged.subscribe(() => {
            if (this.session.Data) this.isTestUser = this.session.Data.roles.indexOf("E2E_Test") >= 0;
        });
        if (this.session.Data)
            this.isTestUser = this.session.Data.roles.indexOf("E2E_Test") >= 0;
    }

    initializeApp() {
        this.platform.ready().then(() => {
            if (this.platform.is('cordova')) {
                this.statusBar.styleDefault();
                this.splashScreen.hide();
            }

            this.initPouchRepositories();
            
            this.pages = [
                { title: 'Home', component: Page.HomePage, icon: "home" },
                { title: 'Settings', component: Page.SettingsPage, icon: "settings" },
            ];
        });
    }

    private initPouchRepositories() {
        let settingsRepository = new RepositoryWithIdPrefix<DataSettingDto>("settings", "id");
        let imageGalleryRepository = new RepositoryWithIdPrefix<DataImageGalleryDto>("images", "id");
        this.pouchDbService.initDatabase("Sowatech.TestAnwendung", [settingsRepository, imageGalleryRepository]);
    }

    menuClosed() { this.events.publish('menu:closed', ''); }
    menuOpened() { this.events.publish('menu:opened', ''); }

    openPage(page: Page.PageModel) {
        this.menu.close();
        this.nav.setRoot(page.component);
    }

    public logout() {
        this.menu.close();
        this.nav.setRoot(Page.LoginPage, { logout: true });
    }
}