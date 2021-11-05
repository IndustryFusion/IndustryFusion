export enum FactoryManagerPageType {
  FACTORY_SITE_LIST,
  FACTORY_SITE_DETAIL,
  ASSET_LIST,
  ASSET_DETAIL,
  ROOM_LIST,
  ROOM_DETAIL,
  ASSET_CARD,
}

export class RouteData {
  public pageTypes: FactoryManagerPageType[];
}
