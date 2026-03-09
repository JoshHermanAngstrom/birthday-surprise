# Birthday Surprise Website

## What This Is
A surprise birthday reveal website for Josh's wife's 30th birthday. She scans a QR code which brings her to the site and goes through a series of fun/prank stages before revealing a Disneyland Paris trip.

## The Flow (8 Stages)

1. **Login Page** — Modern pink themed mock login. Username hint: "Who is the greatest most handsome man in the world?" Password hint: "When was the most beautiful incredible woman born?" Accepts any input.

2. **Runaway Button Prank** — After filling in both fields, the Sign In button dodges her 5 times, sliding to random spots on screen with a fart sound (Web Audio API generated) each time. Text changes each dodge ("Haha, nope!", "Too slow!", "Almost!", "Try again...", "Okay okay, one more..."). On the 6th click it actually signs in.

3. **Maze** — A 12x12 pink-themed maze she navigates with arrow keys, swipe gestures, or on-screen direction buttons. Tracks moves and time.

4. **Kiss Gate** — "Finally, to unlock your gift you have to give your incredible husband a kiss." First click: "Come on... you call that a kiss? Try again!" Second click proceeds.

5. **Gift Box** — 3D pink gift box with bow, floating animation. Tapping opens the lid with confetti burst.

6. **Rickroll** — rickroll.mp4 plays for 10 seconds (the classic bait and switch).

7. **Countdown** — "Okay I promise that was the last one!!" with 5-second countdown. When done, shows "Tap to reveal your gift" button. The button tap is required (not auto-transition) because iOS requires a direct user gesture to play video with sound.

8. **Disney Theme Video** — disney-theme.mp4 plays in full. When it ends, transitions to the reveal.

9. **The Reveal** — Dark enchanted Disney-themed page with sparkles. Staggered animations show:
   - "Happy 30th Birthday!" (script font)
   - "You're Going To"
   - "Disneyland Paris!" (shimmering gold)
   - Castle image (disney-castle-transparent-8.png)
   - Detail cards: Dates (3rd - 6th March 2027), Hotel (Disney's Hotel New York - The Art of Marvel), love message

## Tech Details

- **Pure HTML/CSS/JS** — no frameworks, no build step
- **Fart sounds** — generated with Web Audio API (sawtooth oscillator + noise burst), no audio files needed
- **Videos** — rickroll.mp4 (12MB), disney-theme.mp4 (4MB). Both use `playsinline` for iOS
- **iOS video autoplay** — videos can only play from a direct user tap. Rickroll works because it's triggered from the gift box click. Disney video uses the "Tap to reveal" button as the user gesture
- **Runaway button** — gets moved to `#btn-overlay` (a fixed div on body) to escape parent overflow clipping. Uses CSS transitions for smooth travel between positions
- **Responsive** — works on desktop and mobile. Mobile breakpoint at 480px with smaller fonts, tighter padding, scaled gift box. Maze adapts cell size to screen width
- **Fullscreen iOS** — has web app meta tags so if added to home screen it runs without Safari UI
- **Cache busting** — CSS and JS loaded with `?v=2` query param. Bump the number after changes to force iOS Safari to reload

## Hosted On
- GitHub Pages: https://joshhermanangstrom.github.io/birthday-surprise/
- Repo: https://github.com/JoshHermanAngstrom/birthday-surprise (public, on work account JoshHermanAngstrom)
- To push changes: bump `?v=N` in index.html for the CSS/JS links, then `git add -A && git commit -m "message" && git push`

## Files
- `index.html` — all stage markup
- `styles.css` — all styling (pink theme + Disney reveal theme)
- `script.js` — all logic (stages, fart sounds, maze, runaway button, video playback, confetti, sparkles)
- `rickroll.mp4` — Rick Astley video for the prank
- `disney-theme.mp4` — Disney intro/theme video before the reveal
- `disney-castle-transparent-8.png` — castle image on the reveal page

## Trip Details
- **Destination:** Disneyland Paris
- **Hotel:** Disney's Hotel New York - The Art of Marvel
- **Dates:** 3rd - 6th March 2027
- **Occasion:** Wife's 30th birthday
