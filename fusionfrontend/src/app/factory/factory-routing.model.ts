export enum FactoryManagerPageType {
  COMPANY_LIST,
  COMPANY_DETAIL,
  FACTORY_SITE_LIST,
  FACTORY_SITE_DETAIL,
  ASSET_LIST,
  ASSET_DETAIL,
  ASSET_CARD,
  ROOM_LIST,
  ROOM_DETAIL,
}

export class RouteData {
  public pageTypes: FactoryManagerPageType[];
}
