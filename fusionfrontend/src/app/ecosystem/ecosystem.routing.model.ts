export enum EcosystemManagerPageType {
  ASSET_TYPE_LIST,
  ASSET_TYPE_DETAIL,
  ASSET_TYPE_TEMPLATE_LIST,
  ASSET_TYPE_TEMPLATE_DETAIL,
  FIELD_LIST,
  FIELD_DETAIL,
  QUANTITY_TYPE_LIST,
  QUANTITY_TYPE_DETAIL,
  UNIT_LIST,
  UNIT_DETAIL,
}

export class RouteData {
  public pageTypes: EcosystemManagerPageType[];
}
