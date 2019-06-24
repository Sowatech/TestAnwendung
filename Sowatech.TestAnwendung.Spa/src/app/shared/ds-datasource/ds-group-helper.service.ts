import { Injectable, EventEmitter } from '@angular/core';
import { GroupConfiguration, GroupDataItem } from './ds-dtos.model';

@Injectable() export class GroupHelper {

    public groupConfigurations: Array<GroupConfiguration> = [];
    onGroupConfigurations = new EventEmitter<Array<GroupConfiguration>>();

    public clear() {
        this.groupConfigurations = [];
        this.onGroupConfigurations.emit(this.groupConfigurations);
    }

    public add(groupConfigurations: Array<GroupConfiguration>);
    public add(groupConfiguration: GroupConfiguration);
    public add(arg: any) {
        // handle overload params
        let groupConfigs: Array<GroupConfiguration>;
        if (Array.isArray(arg)) {
            groupConfigs = arg;
        }
        else {
            groupConfigs = new Array<GroupConfiguration>();
            groupConfigs.push(arg);
        }
        // method body
        for (let groupConfig of groupConfigs) {
            let existingConfig = this.getGroupConfigurationByFieldNames(groupConfig.fieldnamesCommaString);
            if (!existingConfig) {
                this.groupConfigurations.push(groupConfig);
            }
        }
        this.onGroupConfigurations.emit(this.groupConfigurations);
    }

    private getGroupConfigurationByFieldNames(fieldnamesCommaString: string): GroupConfiguration {
        let resultConfigs = this.groupConfigurations.filter((item) => { return item.fieldnamesCommaString == fieldnamesCommaString });
        if (resultConfigs.length > 1) console.warn("GroupHandler has duplicate fieldnames");
        return resultConfigs.length > 0 ? resultConfigs[0] : null;
    }

    public set(groupConfiguration: GroupConfiguration) {
        this.groupConfigurations = [];
        this.add(groupConfiguration);
    }

    public execute(dataSource: Array<any>) {
        if (this.groupConfigurations.length > 0) {
            let workSource = dataSource;

            let groupDataItems = new Array<any>();
            let groupConfiguration = this.groupConfigurations[0];//at this time we only implement one level of groups

            for (let dataItem of dataSource) {
                let groupDataItem = this.findGroupDataItem(groupConfiguration, groupDataItems, dataItem);
                if (groupDataItem == null) {
                    groupDataItem = this.createGroupDataItem(groupConfiguration, dataItem);
                    groupDataItems.push(groupDataItem);
                }
                groupDataItem.groupedItems.push(dataItem);
            }
            dataSource.splice(0);
            for (var groupDataItem of groupDataItems) {
                dataSource.push(groupDataItem);
            }
        }
    }

    private findGroupDataItem(groupConfiguration: GroupConfiguration, groupDataItems: Array<GroupDataItem>, dataItem: any): GroupDataItem {
        for (let groupDataItem of groupDataItems) {
            let isFittingGroupDataItem = groupConfiguration.fieldnames.every(f => groupDataItem[f] == dataItem[f]);
            if (isFittingGroupDataItem) return groupDataItem;
        }
        return null;
    }

    private createGroupDataItem(groupConfiguration: GroupConfiguration, dataItem: any): GroupDataItem {
        let newGroupItem: GroupDataItem = {
            groupedItems: new Array<any>()
        };
        for (let f of groupConfiguration.fieldnames) {
            newGroupItem[f] = dataItem[f];
        }
        return newGroupItem;
    }

    public isEqualGroupDataItem(groupItemA: GroupDataItem, groupItemB: GroupDataItem): boolean {
        let result: boolean = true;
        if (this.groupConfigurations != null && this.groupConfigurations.length > 0) {
            let groupDefinition = this.groupConfigurations[0];
            for (let field of groupDefinition.fieldnames) {
                if (groupItemA[field] != groupItemB[field]) {
                    result = false;
                    break;
                }
            }
        }
        return result;
    }
}
