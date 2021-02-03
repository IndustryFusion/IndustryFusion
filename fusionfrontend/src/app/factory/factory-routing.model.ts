export enum FactoryManagerPageType {
  COMPANY_LIST,
  COMPANY_DETAIL,
  LOCATION_LIST,
  LOCATION_DETAIL,
  ASSET_LIST,
  ASSET_DETAIL,
  ROOM_LIST,
  ROOM_DETAIL,
}

export class RouteData {
  public pageTypes: FactoryManagerPageType[];
}
