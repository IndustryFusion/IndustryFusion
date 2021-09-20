alter table asset
    rename column video_key to video_url;

alter table asset
    rename column handbook_key to handbook_url;

alter table asset_series
    rename column video_key to video_url;

alter table asset_series
    rename column handbook_key to handbook_url;
