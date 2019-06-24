import { DatasourceComponent } from '../../ds-datasource';
import { GridConfiguration } from '../swt-grid/swt-grid.component';

//---------------------------------------------------------------------------------------------------------------------------
// General classes, interfaces, types ..
//---------------------------------------------------------------------------------------------------------------------------

//key for dynamic lookups, which are provided during dialog.show as a dictionary[lookupsKey,Array<SelectItem>]
export type lookupsKey = string;

export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'textarea' | 'password' | 'password-with-confirm' | 'email' | 'tel' | 'divider' | 'buttons' | 'info-text' | 'time';

//the type of control. in most cases this is equal to type of field but can differ (e.g. controltype "select")
export type ControlType = 'text' | 'number' | 'date'| 'dateInput' | 'checkbox' | 'textarea' | 'password' | 'password-with-confirm' | 'email' | 'tel' | 'select' | 'divider' | 'buttons' | 'grid' | 'info-text' | 'time';

//this class is used to configure the dialog
export class DialogField {
    fieldname?: string;
    type?: FieldType;
    controlType?: ControlType;//will be set automatically during initialization
    controlTypeVariant?: 'input'; //wenn abweichend vom standrad zb bei datePicker / dateInput
    text?: string;
    unit?: string;
    placeholder?: string;
    help?: string;

    maxLength?: number;
    required?: boolean;
    default?: any;
    trueValueText?: string;//nur fuer type=checkbox
    falseValueText?: string;//nur fuer type=checkbox
    min?: number;
    max?: number;

    lookUps?: Array<SelectItem> | Array<string> | lookupsKey;
    onLookUp?: (lookupItems: Array<SelectItem>, editItem: any) => Array<SelectItem>;//allows the change of shown lookupitems depending on current editItem (e.g. filter of sub-selectItems)
    onChange?: (editItem: any, previousValue: any) => void;//allows to implement dialog-internal logic e.g. drt field2 because of changes to field1
    multiSelectLookups?: boolean;
    radioLookups?: boolean;
    addEmptyLookup?: string;//text for empty lookup

    fieldnamePasswordConfirm?: string;
    autofocus?: boolean;
    hideIf?: (editItem: any) => boolean;//achtung: das edititem hat nicht identische felder zum dto, zb. werden dto.unterobjekte als felder "inline" ins edititem kopiert, auch können felder string sein (durch html selectbox), die eigenltich number sind etc

    buttons?: Array<DialogFieldButton>;
    grid?: DialogGridConfiguration;

    textMask?: TextMaskConfig; //uses textmask see https://github.com/text-mask/text-mask/blob/master/componentDocumentation.md#readme, !!!due to a limitation in browser API, other input types, such as email or number are not supported
}

type FuncRegExp = (text: string) => Array<RegExp|string>;
export class TextMaskConfig {
    mask: Array<RegExp|string>|FuncRegExp;
    guide?: boolean;// default = true
    placeholderChar?: string;//defauls = '_'
    pipe?: (string) => string;
    keepCharPositions?: boolean;//default=false
};

export class DialogFieldCategory {
    name: string;
    dialogFields: DialogField[];
    hideIf?: (editItem: any) => boolean;//achtung: das edititem hat nicht identische felder zum dto, zb. werden dto.unterobjekte als felder "inline" ins edititem kopiert, auch können felder string sein (durch html selectbox), die eigenltich number sind etc
    active?: boolean;

}

export class DialogDynamicList {
    key: string;
    lookupItems?: SelectItem[];
    datasource?: DatasourceComponent;
}

export class DialogFieldButton {
    onButtonClicked?: (editItem: any) => void;
    text?: string;
    tooltip?: string;
    buttonClass?: string;
    iconClass?: string;
    position?: "form" | "footer-before" | "footer-after";
    submitDialog?: boolean;
    submitResult?: string;
}

//export class DialogFieldButtonEvent {
//  buttonIdent: string;
//  itemId: any;
//}

class DialogGridConfiguration extends GridConfiguration {
    datasource: DatasourceComponent | lookupsKey;
}

export const DIALOG_FIELD_NULLVALUE = "$NULL";
