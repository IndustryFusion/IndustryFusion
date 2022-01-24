/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { FactoryAssetDetailsWithFields } from '../store/factory-asset-details/factory-asset-details.model';
import { FieldOption } from '../store/field/field.model';
import { ID } from '@datorama/akita';

export class GroupByHelper {
  public static ASSET_FIELD_INDEX_WITHOUT_VALUE = -1;

  public static updateRowGroupMetaData(factoryAssets: FactoryAssetDetailsWithFields[], selectedEnum: FieldOption): Map<ID, RowGroupCount> {
    const rowGroupMetaDataMap = new Map<ID, RowGroupCount>();
    const sortedAssetFieldIndexTuples: AssetWithFieldIndex[] = GroupByHelper.generateSortedAssetFieldIndexMap(factoryAssets, selectedEnum);

    if (sortedAssetFieldIndexTuples) {
      for (let i = 0; i < sortedAssetFieldIndexTuples.length; i++) {
        const row = sortedAssetFieldIndexTuples[i];
        const enumValue = row.fieldIndex >= 0 ? row.asset.fields[row.fieldIndex].value :
          GroupByHelper.ASSET_FIELD_INDEX_WITHOUT_VALUE;

        if (i === 0) {
          rowGroupMetaDataMap.set(enumValue, new RowGroupCount(i, 1));
        }
        else {
          if (rowGroupMetaDataMap.has(enumValue)) {
            rowGroupMetaDataMap.get(enumValue).count++;
          } else {
            rowGroupMetaDataMap.set(enumValue, new RowGroupCount(i, 1));
          }
        }
      }
      return rowGroupMetaDataMap;
    }
    return null;
  }

  public static generateSortedAssetFieldIndexMap(factoryAssets: FactoryAssetDetailsWithFields[], selectedEnum: FieldOption)
    : AssetWithFieldIndex[] {
    return factoryAssets.sort((asset1, asset2) => {
      const fieldIndexOfAsset1 = GroupByHelper.getFieldIndexOfSelectedEnum(asset1, selectedEnum);
      const fieldIndexOfAsset2 = GroupByHelper.getFieldIndexOfSelectedEnum(asset2, selectedEnum);
      if (fieldIndexOfAsset1 < 0) {
        return 0;
      } else if (fieldIndexOfAsset2 < 0) {
        return -1;
      } else {
        return asset1.fields[fieldIndexOfAsset1].value.localeCompare(asset2.fields[fieldIndexOfAsset2].value);
      }
    }).map(factoryAsset => {
      return new AssetWithFieldIndex(factoryAsset, GroupByHelper.getFieldIndexOfSelectedEnum(factoryAsset, selectedEnum));
    });
  }

  public static getFieldIndexOfSelectedEnum(factoryAsset: FactoryAssetDetailsWithFields, selectedEnum: FieldOption): number {
    return factoryAsset.fields.indexOf(factoryAsset.fields.filter(field => field.name === selectedEnum.optionLabel).pop());
  }

  public static checkIfRowDataMapIndexMatchesRowIndex(rowGroupMetaDataMap: Map<ID, RowGroupCount>, asset: FactoryAssetDetailsWithFields,
                                                      rowIndex: number, selectedEnum: FieldOption): boolean {
    return (GroupByHelper.getFieldIndexOfSelectedEnum(asset, selectedEnum) !== -1 ? rowGroupMetaDataMap.get(asset.fields[
      GroupByHelper.getFieldIndexOfSelectedEnum(asset, selectedEnum)].value).index : rowGroupMetaDataMap.get(
        GroupByHelper.ASSET_FIELD_INDEX_WITHOUT_VALUE).index) === rowIndex;
  }
}

export class RowGroupCount {
  index: number;
  count: number;
  constructor(index: number, count: number) {
    this.index = index;
    this.count = count;
  }
}

export class AssetWithFieldIndex {
  asset: FactoryAssetDetailsWithFields;
  fieldIndex: number;
  constructor(asset: FactoryAssetDetailsWithFields, fieldIndex: number) {
    this.asset = asset;
    this.fieldIndex = fieldIndex;
  }
}
