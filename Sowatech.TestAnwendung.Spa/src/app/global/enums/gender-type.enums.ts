import { TranslationService } from "angular-l10n";

export enum GenderType { unknown = 0, female = 1, male = 2, other = 3 }
export class GenderTypeHelper {

    public static displayText(value: GenderType, translate: TranslationService): string {
        return value != undefined ? GenderTypeHelper.selectItems(translate).find((item) => item.value == value).text : "";
    }

    public static displayTextAnrede(value: GenderType, translate: TranslationService): string {
        var result = "";
        if (value != undefined) {
            switch (value) {
                case GenderType.male:
                    result = translate.translate("GLOBAL.ENUMS.GENDER.MALE");
                    break;
                case GenderType.female:
                    result = translate.translate("GLOBAL.ENUMS.GENDER.FEMALE");
                    break;
                case GenderType.other:
                case GenderType.unknown:
                    result = translate.translate("");
                    break;
            }
        }
        return result;
    }

    public static cssClass(value: GenderType): string {
        var result = "";
        if (value != undefined) {
            switch (value) {
                case GenderType.male:
                    result = "fa-male";
                    break;
                case GenderType.female:
                    result = "fa-female";
                    break;
                case GenderType.other:
                    result = "fa-android";
                    break;
                case GenderType.unknown:
                    result = "fa-user-o";
                    break;
            }
        }
        return result;
    }

    public static selectItems(translate: TranslationService): Array<SelectItem> {
        return [
            { value: GenderType.male, text: translate.translate("GLOBAL.ENUMS.GENDER.MALE") },
            { value: GenderType.female, text: translate.translate("GLOBAL.ENUMS.GENDER.FEMALE") },
            { value: GenderType.other, text: translate.translate("GLOBAL.ENUMS.GENDER.OTHER") },
            { value: GenderType.unknown, text: translate.translate("GLOBAL.ENUMS.GENDER.UNKNOWN") }
        ]
    }
}
