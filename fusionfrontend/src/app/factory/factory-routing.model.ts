export enum FactoryManagerPageType {
  COMPANY_LIST,
  COMPANY_DETAIL,
  FACTORY_SITE_LIST,
  FACTORY_SITE_DETAIL,
  ASSET_LIST,
  ASSET_DETAIL,
  ROOM_LIST,
  ROOM_DETAIL,
}

export class RouteData {
  public pageTypes: FactoryManagerPageType[];
}
