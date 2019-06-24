import { TranslationService } from 'angular-l10n';

export class NavItem {
    constructor(src?: NavItem, translation?: TranslationService) {
        if (src) {
            for (let prop in src) {
                this[prop] = src[prop];
            }
            if (translation) {
                if (src["textKey"]) {
                    let key = "NAV_DATA." + src["textKey"];
                    let localizedText = translation.translate(key);
                    if (localizedText) this["text"] = localizedText;
                }
            }
        }
    }
    text?: string;//the displayed text
    textKey?: string;//the text-resource key (for localized text)
    visible?: boolean;//set to false to hide in menu (but e.g. still visible in breadcrumb)
    path?: string | "CUSTOM";//use "CUSTOM" to trigger the navservice.onCustomNavigate (at this time only implemented in breadcrum, not in menu)
    iconClass?: string;//image icon
    items?: Array<NavItem>;
    visibleForRoles?: Array<string>;
    collapsed?: boolean;
}