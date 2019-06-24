

export class NavItemsDto {
    public navItems: NavItemDto[];
}

export class NavItemDto {
    text?: string;//the displayed text
    textKey?: string;//the text-resource key (for localized text)
    visible?: boolean;//set to false to hide in menu (but e.g. still visible in breadcrumb)
    path?: string | "CUSTOM";//use "CUSTOM" to trigger the navservice.onCustomNavigate (at this time only implemented in breadcrum, not in menu)
    iconClass?: string;//image icon
    items?: Array<NavItemDto>;
    visibleForRoles?: Array<string>;
    collapsed?: boolean;
}
