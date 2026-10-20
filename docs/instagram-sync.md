# Authorized Instagram account sync

`pc-instagram` reads the account authorized by `INSTAGRAM_ACCESS_TOKEN` using Instagram Login. It calls the fixed graph.instagram.com/v26.0 endpoint with a private Bearer header and preserves original captions, post URLs and image/carousel URLs. No token is returned or logged. The collector token is hashed and checked against an enabled private config; a lease prevents concurrent runs.

Cron runs every six hours. It reads at most 25 recent posts per sync. Private social leads are visible only through the existing Clerk administrator endpoint. They are evidence, not published events; no event date or venue is inferred merely from a post timestamp. Instagram CDN image links can expire and are refreshed on subsequent syncs. Retention is 30 days while the collector is enabled. Facebook Login/hashtag discovery and public-account discovery remain unconnected. This does not scan other Instagram accounts.

Connection state in pc_instagram_status records last success, safe error code, username and count. A token error (especially code 190) requires checking token expiry/revocation; this implementation does not automatically exchange or refresh credentials. Store replacement tokens only in Supabase Edge Function Secrets.

Verified live on 20 October 2026: @silk_ai_ connected, one post read. Tests: node tests/instagram-sync.cjs.
