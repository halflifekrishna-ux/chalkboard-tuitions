---
name: make-vid
description: Makes a short vertical video for Chalkboard Tuitions end to end. Takes a topic or rough idea, fixes the hook, writes the script and shot list, generates the clips, voice and captions with the connected Higgsfield tools after a cost check, and returns a card ready to post. Use when the user types /make-vid or asks for a Reel, Short, TikTok or ad video for Chalkboard.
version: 1.0.0
---

# make-vid

Turns an idea into a postable short video for Chalkboard Tuitions, Kammanahalli, Bengaluru. It extends the Hook Master suite (see [references/hook-engine.md](references/hook-engine.md)): same hook discipline, plus script, shot list, asset generation and a posting plan.

Parents buy trust, not beauty (docs/BRAND_ARCHITECTURE.md, rule 0). Every video should answer one parent question fast.

## Step 0: Brief

Needed: the one parent question or worry the video answers, the grade and board, what real footage or photos exist, the length (default 20 to 30 s vertical 9:16), the platform (Instagram Reel, YouTube Short, WhatsApp status), and the call to action (default: book a free assessment).

If the user gave a topic and little else, do not interrogate. Pick the most likely parent question from the facts file, state your guesses under Check these, and go. Ask (at most four short questions, then wait) only when you cannot tell what is true or what footage exists.

## Step 1: Hook

Run the hook engine in [references/hook-engine.md](references/hook-engine.md): four failures, viewer panel (buyer and beginner matter most for a local tuition centre), council, six formats, niche tuner, visual match, lock-in. Work silently. Output only the winning hook and two backups in the final card.

## Step 2: Script and shot list

Write a table, one row per beat:

| Beat | Time | Shot | Spoken | On-screen text | Source |
|---|---|---|---|---|---|

- Hook beat first (0 to 3 s). Lock-in next (3 to 8 s). Then one idea per beat, 3 to 5 s each.
- Total length from the brief, or the default. Times are plan targets, say so.
- Source for each shot: REAL (user footage or photo), GENERATED (image or video model), or GRAPHIC (text card or chalkboard animation).
- Last beat is the call to action with the real contact line from the facts file.
- Prefer REAL and GRAPHIC. Generate only what the story needs.
- Subtitles and on-screen text must be readable with sound off, 3 to 7 words, upper middle of the frame.

Read the script aloud in your head with the sound off, then with eyes closed. Both must still make sense.

## Step 3: Set up generation

List the assets to make: each clip or image, the model you recommend and the duration. Get model choice and credits from the tools, not memory:

1. Load the tools: `ToolSearch` with `select:mcp__higgsfield__models_explore,mcp__higgsfield__balance,mcp__higgsfield__generate_image,mcp__higgsfield__generate_video,mcp__higgsfield__generate_audio,mcp__higgsfield__jobs_wait`.
2. Call `get_workflow_instructions` with no argument first, since a short video is a multi step workflow.
3. `balance` for credits, `models_explore` with action `recommend` for model choice and price.

If Higgsfield is unavailable or the balance is short, deliver the script, shot list and prompts anyway, and say which step is blocked. Canva's `generate-image` and `generate-design` are the fallback for stills and text cards.

## Step 4: Generate

- Batch independent clips with `generate_video_batch` or `generate_image_batch`, then `jobs_wait` with `timeout_seconds` 15 or less, repeated until done.
- Prompts describe the scene, camera and light, and state "no text, no logos". Add text yourself as on-screen overlays, because generated text is unreliable.
- Voice: only if the user wants a voiceover, with `generate_audio` or `create_voice`. Never clone a real person's voice without their say so.
- Check every output against the script. Reject and regenerate anything with garbled text or that does not match the beat.
- Download kept files into `public/video-drafts/<slug>/` (create it; do not commit large media unless the user asks). Name files `01-hook.mp4`, `02-lockin.mp4` and so on.

## Step 5: Assemble

If `ffmpeg` is installed, stitch the clips in order, burn in the on-screen text and captions, normalise audio, and export `<slug>.mp4` at 1080 by 1920. Check with `ffmpeg -version` first. If it is not installed, say so and hand over the ordered file list, the caption text and an SRT file instead of guessing. Never claim a file exists without listing it.

## The card (your whole reply)

Use these headings, in this order. Keep it tight.

**Parent question this answers.** One line.

**Hook (top pick).** First shot, say, on-screen text, why it works. Then two backups, one line each.

**Script.** The beat table from Step 2.

**Files.** Paths of everything made, and what is still a plan.

**Caption.** Platform caption, 2 to 3 short lines, the call to action, the real phone and address from the facts file, and 3 to 5 plain hashtags that are about tuition in Bengaluru, not trends.

**Test it.** Post the top pick. Compare 3 second hold and average watch time in the platform's insights against the last five videos. Or post two hooks on the same topic a week apart. No predicted numbers.

**Check these.** At most three facts to confirm before posting.

## Self-check before you answer

- [ ] Topic is clear in the first sentence and the first shot, with sound off.
- [ ] Hook payoff arrives within 5 seconds.
- [ ] Contact line matches the facts file exactly.
