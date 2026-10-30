# Genesis Kids

Playful learning activities for children in **Pre-K through grade 3**, in the spirit of
sites like Starfall. This first release covers the **ABCs**.

It is a plain web app: HTML, CSS and JavaScript modules, with no build step and no
dependencies. It runs in any modern browser, on phones, tablets and computers.

## Activities

| Activity | Grade | What the child does |
| --- | --- | --- |
| ABC Explorer | Pre-K | Tap any letter to hear its name, its sound and a picture word |
| Find the Letter | Pre-K | Hear a letter, tap it. Uppercase first, then lowercase with look-alikes (b, d, p, q) |
| Trace It | Pre-K to K | Trace a big dotted letter with a finger or mouse |
| Match Up | K | Pair each uppercase letter with its lowercase partner |
| First Sounds | K to 1 | See a picture, pick the letter its word starts with |
| Missing Letter | 1 to 2 | Find the missing letter in a run of the alphabet |
| Word Order | 2 to 3 | Put three words in ABC order, then words that share a first letter |

Children earn up to three stars per activity. Stars are saved on the device only.

## Run it

```sh
npm start        # serves the folder at http://localhost:8080
npm test         # unit tests for the question logic (Node 20+)
```

Any static file server works, for example `python3 -m http.server`. Opening
`index.html` straight from disk will not work because browsers block JavaScript
modules on `file://`.

The site is just static files, so it can be hosted on GitHub Pages, Netlify or any web host.

## How it is organised

```
index.html            page shell
css/styles.css        all styling
js/main.js            top bar, hash router, home screen
js/data.js            the alphabet, picture words, word sets
js/logic.js           pure question builders and star ratings (unit tested)
js/quiz.js            shared "tap the right answer" activity
js/ui.js              small DOM helpers, results screen, confetti
js/speech.js          spoken prompts (text-to-speech)
js/sfx.js             synthesized sound effects
js/store.js           stars and settings saved on the device
js/activities/        one file per activity
tests/                unit tests
```

### Adding an activity

1. Create `js/activities/my-activity.js` exporting `{ id, title, icon, level, color, intro, start(ctx) }`.
2. Add it to the list in `js/activities/index.js`.

`start(ctx)` draws into `ctx.root`. Use `ctx.say(...)` to speak, `ctx.later(fn, ms)`
for timers (they are cleaned up when the child leaves), `ctx.award(stars)` to save
progress and `ctx.restart()` to play again. For another multiple-choice game, write a
question builder in `logic.js` and hand it to `runQuiz`, as `find-letter.js` does.

## Design choices

- **Made for children who cannot read yet.** Every instruction is spoken, answers are
  big tap targets, and there is a speaker button to hear the question again.
- **Gentle feedback.** A wrong answer shakes, says the letter that was tapped and asks
  to try again. Nothing is ever taken away.
- **No accounts, no tracking.** Nothing leaves the device. This keeps the app simple
  to share with schools and avoids collecting children's data.
- **Honors reduced-motion settings** and labels controls for screen readers.

## Known limits and next steps

- **Audio is synthetic.** Spoken letter names and sounds use the browser's built-in
  voice, and isolated phonics sounds ("buh", "kuh") are only approximate. For a
  real product, record a teacher's voice for each letter, sound and word. `speech.js`
  is the one place to change.
- **Pictures are emoji** (plus one small drawing for the igloo), which look different on
  each device. Custom illustrations would give a consistent look.
- **Tracing checks how much of the letter was covered, not stroke order or direction.**
  Showing the correct strokes needs stroke-path data per letter. The scoring
  thresholds were tuned on a desktop browser and should be checked on real tablets.
- Ideas for later: sight words, simple word building, math, a progress view for
  parents and teachers, offline use as an installable app, other languages.

## Content and copyright

All activities, wording and artwork here are original. Do not copy Starfall's
characters, artwork, audio or lesson text. Similar ideas are fine, their material is not.
