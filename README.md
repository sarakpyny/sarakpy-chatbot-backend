# Website chatbot backend

This is a separate Git repository and Vercel project. Local changes do not update
the deployed chatbot. Its knowledge represents the prepared December 2026 profile.

## Configuration

- `OPENAI_API_KEY`: required for real answers. Keep it server-side.
- `SHEETS_WEBHOOK_URL`: optional Google Apps Script logging endpoint. If unset,
  no questions are sent to Sheets. Logs contain only the current question and
  page path, not browser information or conversation history. Logging runs
  alongside generation with a two-second timeout.

The previous hard-coded Sheets URL is no longer used; set the environment
variable if you want to retain logging. The chatbot footer notice was removed
at the site owner’s request.

## Local preview of the updated backend

Create an untracked `.env` file in this directory containing `OPENAI_API_KEY=...`.
Then, from this directory, run:

```sh
node --env-file=.env dev.mjs
```

In a second terminal, from the website root:

```sh
PUBLIC_CHAT_API_URL=http://127.0.0.1:3001/api/chat npm run dev
```

Open the Astro URL. Submitting a question makes a real API call and uses API
credits. Startup and automated tests do not. Stop both servers with Ctrl+C.
Without `PUBLIC_CHAT_API_URL`, the website continues using the live Vercel backend.

## Validation and limits

```sh
node --test test/chat.test.js
```

Tests mock generation and logging; no API key or network is required.
Questions are limited to 1,500 characters. History accepts only alternating user
and assistant messages, at most 12 messages / 24,000 serialized characters.
The frontend sends the last three successful exchanges and clears them on reload
or New chat. Replies are capped at 500 output tokens. Generation times out after
20 seconds with retries disabled; the frontend times out after 25 seconds.

The 10-requests-per-minute IP limiter is **per warm process**, not a distributed
quota. It resets on cold starts and does not synchronize across Vercel instances.
Use a shared store or hosting-level rate limiting before relying on it for public
cost protection. CORS is not authentication. The host should enforce body-size
limits (the local adapter uses 32 KB).

Conversation history uses the manual-history approach described at
https://developers.openai.com/api/docs/guides/conversation-state . Responses use
`store: false`; this is not a promise of zero provider-side retention.

## Saved December update

The `december-2026-update` branch is configured in `vercel.json` not to trigger
automatic Vercel deployments. Merging into the production branch later can deploy
the update; do that only when ready to publish.
