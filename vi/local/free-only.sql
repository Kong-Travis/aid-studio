-- Free-only setup for a local AID used to record the Vietnamese tutorial.
-- Run after sql/*.sql and vi/sql/vi-labels.sql, then restart the backend (settings and model
-- lists are loaded at startup). Re-running is safe.
--
-- 1. Only two Gemini API free-tier text models stay enabled: the "gemini-3-flash-preview" row (sent
--    upstream as gemini-3.6-flash, see below) and gemini-3.1-flash-lite. Both upstream models are
--    "Free of charge" in the free tier on https://ai.google.dev/gemini-api/docs/pricing (page updated
--    2026-10-22, checked 2026-10-27). Use a key from a Google Cloud project WITHOUT a billing account.
-- 2. Every text function is bound to those two models. Image, video and audio functions keep their
--    bindings but all their models are disabled: images and clips are made outside AID for free
--    and imported.
-- 3. Final export uses the local FFmpeg from Homebrew.
-- 4. Media URLs point at the local web origin (nginx proxies /profile/).
SET NAMES utf8mb4;

UPDATE aid_ai_model
SET status = CASE WHEN model_code IN ('gemini-3-flash-preview', 'gemini-3.1-flash-lite') THEN '0' ELSE '1' END,
    update_by = 'vi-local', update_time = NOW()
WHERE del_flag = '0';

-- The free tier allows only 20 requests per day per model (quota
-- GenerateRequestsPerDayPerProjectPerModel-FreeTier, seen 2026-10-26), and the storyboard step's
-- JSON is too much for gemini-3.1-flash-lite ("分镜场次根结构异常"). Point the "Flash" row at the
-- newer gemini-3.6-flash ("Free of charge" in the free tier, pricing page above), which answered on
-- the same no-billing key (2026-10-26). A key in a
-- project without a billing account cannot be charged; over quota it only returns HTTP 429.
UPDATE aid_ai_model
SET real_model_code = 'gemini-3.6-flash', model_name = 'Gemini 3.6 Flash'
WHERE model_code = 'gemini-3-flash-preview' AND del_flag = '0';
UPDATE aid_ai_model_protocol_binding b
JOIN aid_ai_model m ON m.id = b.model_id
SET b.definition_json = JSON_SET(b.definition_json, '$.upstreamModel', 'gemini-3.6-flash')
WHERE m.model_code = 'gemini-3-flash-preview' AND m.del_flag = '0' AND b.capability_code = 'text';

UPDATE aid_ai_model_func_config f
JOIN (SELECT JSON_ARRAY(
        (SELECT id FROM aid_ai_model WHERE model_code = 'gemini-3-flash-preview' AND del_flag = '0' LIMIT 1),
        (SELECT id FROM aid_ai_model WHERE model_code = 'gemini-3.1-flash-lite' AND del_flag = '0' LIMIT 1)
      ) AS ids) g
SET f.model_ids = g.ids, f.update_by = 'vi-local', f.update_time = NOW()
WHERE f.del_flag = '0' AND f.model_type = 'text';

UPDATE aid_config SET config_value = 'true' WHERE category = 'mps' AND config_name = 'enabled';
UPDATE aid_config SET config_value = 'local-ffmpeg' WHERE category = 'mps' AND config_name = 'processMode';
-- Subtitles are burned in with the drawtext filter. Homebrew's plain `ffmpeg` (8.x) has no
-- libfreetype, so export fails with "No such filter: 'drawtext'". Use `brew install ffmpeg-full`
-- (homebrew/core, keg-only, includes freetype and libass).
UPDATE aid_config SET config_value = '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg' WHERE category = 'mps' AND config_name = 'ffmpegPath';
UPDATE aid_config SET config_value = '/opt/homebrew/opt/ffmpeg-full/bin/ffprobe' WHERE category = 'mps' AND config_name = 'ffprobePath';
UPDATE aid_config SET config_value = '/System/Library/Fonts/Supplemental/Arial Unicode.ttf'
WHERE category = 'mps' AND config_name = 'ffmpegFontFile';

UPDATE aid_config SET config_value = 'http://localhost:3000'
WHERE category = 'oss' AND config_name = 'resourceAccessDomain';
