ALTER TABLE asset
    RENAME COLUMN handbook_url TO manual_key;

ALTER TABLE asset
    RENAME COLUMN video_url TO video_key;

ALTER TABLE asset_series
    RENAME COLUMN handbook_url TO manual_key;

ALTER TABLE asset_series
    RENAME COLUMN video_url TO video_key;