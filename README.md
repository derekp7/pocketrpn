# PocketRPN — RPN Scientific Calculator

A stack-based (RPN) scientific calculator — one HTML file, its plain-text help
file, and one vendored math library — that installs as an offline-capable app on
Android, iOS, and desktop browsers.

The keypad is laid out like a classic RPN machine: numbers go on the stack,
operators act on it, and two modifier keys — **Inv** (the inverse of a function)
and **Fn** (a related function) — quadruple what every key can do. The stack has
no fixed depth, every level is numbered (position `0` is the top item), and the
full set of stack moves is on the face of the keypad. Behavior itself —
precision, notation, what the calculator remembers between launches — is set
from a **Menu** that lives on the display (Fn + STO).

## Try it

Open `index.html` in a browser — no build step, no install, no network required,
and no web-server needed to try it: opening the file directly (`file://`) works,
which is why `decimal.min.js` and `docs.js` are plain `<script src>` tags rather
than ES modules or `fetch()`ed data — a page loaded from disk cannot read a
second file either of those ways. Copy the whole directory, though: an
`index.html` on its own is a working calculator whose Help pages say the
documentation did not load.

For install and offline mode the files must be served over
`https://` or `http://localhost` (any static server will do, e.g.
`python3 -m http.server`).

## The stack

The display shows the numbered levels, newest at the bottom:

```
2:  3        <- deepest shown
1:  2
0:  1        <- position 0 = top of stack (X)
|            <- entry line (where you type)
```

`ENTER` pushes what is in the entry line; functions operate on level 0 and put
the result back. To compute `12 ÷ 5`: press `1 2 ENTER 5 ÷`.

**Lst X** recalls the value that was on top before the last calculation — HP's
LASTX: for a two-number operation that is the *second* operand, so after
`10 3 −` it gives back `3`, ready to re-edit and retry the step.

The rule, in full:

> Any operator that consumes one or more values from the stack stores the
> value in position `0` into **Lst X** (a pending entry is pushed first, as if
> `ENTER`). No other operation that changes position `0` — pushing a number,
> or any pure stack move (`Dup`, `swap`, `roll`, `Edit`, …) — sets Lst X.

Lst X serves the calculation flow, not undo: it is there so a recalled
operand survives everything you do *around* a computation — including an
`Edit` to fix an entry — until the next operator replaces it. (Edit followed
by `C` can lose a value; so can `Drop`, and neither saves one.)

## Keys

### Stack moves (row 1) and housekeeping (row 2)

Directions follow the display: **down** means values flow toward position 0,
**up** means they climb away from it. The *n*-variants take their operand from
the stack first, then act on what remains.

| key | Inv | Fn | Fn+Inv |
|---|---|---|---|
| `dup` — copy level 0 | | `nip` — delete level 1 | `tuck` — copy level 0 below level 1 |
| `over` — copy level 1 | | `n pick` — copy stack position *n* | |
| `swap` — exchange levels 0 and 1 | | `rot↓` — rotate top three down | `rot↑` |
| `roll↓` — roll the whole stack down | `roll↑` | `n roll↓` — roll top *n* levels | `n roll↑` |
| `drop` — delete level 0 | | `n drop` — delete *n* items | `depth` — push the number of levels |

Row 2 holds the housekeeping keys — `AC` (clear stack and entry), `C` (clear
the entry line), and `Edit` (pop level 0 into the entry line, with `Lst X` on
Fn) — beside the two operator keys `xʸ` and `%`.

### Scientific (rows 3–4)

| key | Inv | Fn | Fn+Inv |
|---|---|---|---|
| `sin` | `asin` | `sinh` | `asinh` |
| `cos` | `acos` | `cosh` | `acosh` |
| `tan` | `atan` | `tanh` | `atanh` |
| `ln` | `eˣ` | `Γ(x)` — gamma (*x!* = Γ(*x*+1)) | `invΓ` — inverse gamma |
| `log` | `10ˣ` | `log₂` | `2ˣ` |
| `√x` | `x²` | `∛x` | `x³` |
| `1/x` | | `n!` | |
| `±` — negate the entry line | | `neg` — negate level 0 | |
| `EE` — exponent entry (`2 EE 3` = 2×10³) | `EE−` | `ENG` — toggle Scientific/Engineering notation | |

Two operator keys carry modifiers of their own:

| key | Inv | Fn |
|---|---|---|
| `xʸ` — power: *x* to the *y* | `ˣ√y` — the *x*'th root of *y* | `log_y(x)` — log of *x* to the base *y* (`8 ENTER 2 log_y(x)` → 3) |
| `%` — divide by 100 | `×100` — multiply by 100, the exact inverse | `%Δ` — HP percent-change between two values (`3 5 %Δ` → +66.67) |

Operands are entered **in the order they are spoken** — say it, type it.
That single rule covers every binary key on this calculator, and every face
labels its variables to match: **enter x first, then y, then the key**.

| face | spoken as | pos 1 (typed first) | pos 0 (top) | solves for |
|---|---|---|---|---|
| `xʸ` | "x to the y" | *x* — base | *y* — exponent | result |
| `ˣ√y` | "x-th root of y" | *x* — index | *y* — radicand | base |
| `log_y(x)` | "log of x to the base y" | *x* — argument | *y* — base | exponent |

`log_y(x)` is rendered with a real subscript: `log<sub>y</sub>(x)` on the key
cap, which is why labels in the modifier tables go through `setLabel()` rather
than a bare `textContent` (see *Key label markup* below).

It replaced an older `logₓy` label that put *x* before *y* on the face while the
stack took the argument first — cap and entry order disagreed. **This was a label
change only**: stack order, arithmetic and Lst X are untouched, so the reversal
cycle below is unaffected. Older HP machines took the same position in the same
direction — with x/y/z/t registers they labelled keys by the *stack* letter rather
than by convention (`2ˣ` became `2^y`), so a key always named the register it
actually consumed.

The three faces chain into a **closed reversal cycle**: after any one of
them, `Lst X` + `Swap` + the *next* key in the cycle pow → root → log → pow
recovers the third value — and keeps cycling forever:

```
2 ENTER 3 xʸ       ->  8    (Lst X remembers 3)
Lst X  Swap ˣ√y    ->  2    cube root of 8 — the original base (Lst X = 8)
Lst X  Swap log_y(x) ->  3    log of 8 to the base 2          (Lst X = 2)
Lst X  Swap xʸ     ->  8    ...and around again, indefinitely
```

Exactly one swap per reversal is the arithmetic floor — an operator eats two
values, leaves one, and Lst X saves only its top operand — and this scheme
spreads it evenly: every key has exactly one reversal partner.

Every key does one thing per mode: nothing here changes behavior depending on
how many values happen to be on the stack.

### Registers (STO / RCL)

The `STO` key beside Deg/Rad files a value into one of ten registers; **Inv**
turns it into `RCL`. Pressing either one *arms* a pick: every digit button
grows a corner tag — the keypad telling you what digits mean right now — and
the next digit completes the operation. The tags vanishing is the confirmation.

| key | Inv | Fn |
|---|---|---|
| `STO` — arm a store | `RCL` — arm a recall | `Menu` — open the menu |

**The tag colour shows occupancy**: orange means the register holds a value,
dim grey means it is empty. That is also why no dialog ever interrupts this
flow — an invalid pick simply does nothing and stays armed, and the visible
tags explain why:

- `STO` with nothing on the stack still arms (digits do nothing until there is
  a value to store; any other key disarms).
- `RCL` of an empty register changes nothing — pick a different one.

**Store** copies level 0 into register *n*, leaving the stack exactly as it was
(a pending entry is committed first, like every other mover, so typing a
number and pressing `STO 2` works without ENTER). **Recall writes into the
entry line**, replacing whatever was being typed — recalled values land there
to be edited before use, which pushing to the stack could not offer. Recall
hands over the value's **full stored digits**, not just the 15 shown on the
stack: an unedited recall (or `Edit`, or `Lst X`) pushed back with ENTER
round-trips every guard digit.

**Clearing lives in the store flow.** While `STO` is armed the `.` key grows a
*Clear* tag; pressing it enters clear mode, where the word lights up, digit
keys clear single registers, and `⌫` — tagged *Clear All* — empties all ten.
Clear mode stays armed until you leave it, so a cleared register's tag is seen
dimming from orange to grey: the keypad shows the wipe happening. Wiping
everything takes two deliberate presses (`.` then `⌫`).

Registers deliberately **survive AC**: All Clear wipes the working stack, not
the values you filed away on purpose — and with *Remember registers* on (the
default; see Stored settings) they survive **launches** too.

In **Deg** mode the trig functions snap exact multiples of 90° to their true
values (`sin 180` is `0`, not `1.2e-16`) and `tan 90` reports *Undefined*
rather than a huge number. Domain errors (`√−4`, `1÷0`, `atanh 2`) alert and
leave the stack as it was. (`∛x` is the exception that became a feature:
negative radicands compute — `∛−8` is `-2`.)

### Math engine

Arithmetic runs on [decimal.js](https://mikemcl.github.io/decimal.js/) (MIT),
vendored as one file, not on IEEE 754 doubles: `0.1 + 0.2` is exactly `0.3`,
cancelling chains do not drift, and `(10¹² + 1) − 10¹²` is `1`, not `0`.

* **40 digits internally, 15 on the LCD** (both are Preferences; these are
  the defaults). Results are stored unrounded; one display formatter rounds to
  the display width at the last moment, HP-style guard digits. The gap is what
  lets a long run of 9s *carry* on its way to the screen, and it is why
  `1 ÷ 3 × 3` shows exactly `1`.
* **Scientific notation at explicit cutoffs** (both Preferences). A value goes
  to exponent form when its plain form would occupy more than *Large → sci at*
  integer positions (default 15) or carry more than *Small → sci at* leading
  zeros after the decimal point (default 5 — reproducing the classic boundary
  where `0.000001` stays plain and `0.0000001` reads `1e-7`). A 20-digit integer prints
  `1.23456789012346e+19`, never `12345678901234600000`: the five trailing zeros
  were never in the value, and a **never-lie floor** keeps it that way whatever
  the cutoffs say — if display rounding ate real digits into integer places,
  exponent form is forced. Inside both cutoffs everything stays plain: `1200`,
  `0.00052`, a rounded fraction like `1.23456789012346`.
* **Engineering = scientific, different exponent base.** One decision
  (`wantsExponent`) picks the form for both notations; engineering only rewrites
  an already-scientific value onto a multiple-of-three exponent (`1.23e+25 →
  10E+24`). Plain numbers stay plain in ENG — no per-notation thresholds to drift.
* Storage keeps its own, wider rule: exponential text only past the register
  width, so Edit / RCL / Lst X always hand back every digit in plain form (see
  Entry editing). The cutoffs govern *display*, never what is kept. Both storage
  bounds are register-derived and symmetric — an inherited `e < -6` once sent
  small numbers to exponent form while large ones stayed plain out to twice the
  register width, quietly breaking that promise for one direction.
* **Edit-window compaction (off by default).** `Edit zeros → sci` is a *padding*
  rule, not a size rule: recall writes exponent form only once a value's
  placeholder zeros — trailing after the last significant digit, leading after
  the decimal point — exceed the cutoff. So `20000000000000000000` (19 padding)
  recalls as `2e+19` while `12345678901234567891` (zero padding) keeps all
  twenty digits, and interior zeros never count: `10000000000000000001` stays
  plain. One threshold covers both directions because leading and trailing zeros
  are the same kind of noise. The mantissa prints at register precision (never
  display width), applies on recall only — typed text and `±` are never
  reformatted — and is lossless: the entry parser takes `2e+19` straight back.
  **0 = Off**, the default, so nothing abbreviates until asked.
* **Cascade-snap.** A computed result ending in a ≥20-digit run of 9s carries at
  the start of the run (`0.999…9 → 1`, `2.499…9 → 2.5`); its mirror,
  `d.000…001`, collapses to `d` (`√2 x²` is exactly `2`). These are the two
  shapes cancelling round-trips leave behind, so `1÷3×3−1`, `2÷3×3−2`,
  `ln(eˣ)−x` and `√x²−x` all land on exact zero. Values *typed* reach the stack
  untouched — only computed results snap — and genuine tiny numbers survive:
  `(1 + 1e−35) − 1` still shows `1e−35`, `1e−20 × 1e−20` still shows `1e−40`.
* **What did not change:** the domain guards (the engine answers `√−4` with a
  silent NaN, so they matter more than ever), the Deg quarter-turn snap (π is
  transcendental; no finite precision makes `sin 180°` exact on its own), and
  gamma/inverse-gamma, which stay double-precision Lanczos internals.
* Factorials are exact big products now — `20!` keeps every digit and 50!
  exists (doubles turned Infinity at 171!).

### Entry editing

The entry line has a real cursor: `←` / `→` move it (hold either and it
auto-repeats — 420 ms before the first repeat, then every 75 ms), digits insert
at it, and an
exponent marker (`e+`, `e−`) counts as one token — the cursor steps over both
characters and backspace deletes both, so you can never end up with a broken
number like `2+3` from a half-deleted `2e+3`. `EE` flips the sign of an existing
exponent instead of adding a second one.

**Tap in the entry line to position the cursor.** The tap is decided inside the
pan handler rather than as a separate click listener — that one state machine
already knows whether the gesture moved, and two listeners each guessing "was it
a tap?" eventually disagree. A press longer than 450 ms is left alone, which is
what keeps the native hold-to-select-the-number working; a drag pans and never
touches the cursor. Positioning is computed geometrically (character boundary
rects across the two text nodes) rather than with `caretRangeFromPoint`, because
the rendered line is `[before][caret '|'][after]` and a DOM offset carries an
off-by-one that depends on which side of the caret you landed on. A tap can never
rest between `e` and its sign.

A number wider than the display **scrolls** instead of being cut off: the
cursor is always kept on screen, so typing a long number naturally pushes its
start off to the left, and stepping the cursor with `←` / `→` scrolls it back
when the cursor reaches an edge. A `…` chip appears over either edge while text
continues that way. Touch or mouse-drag directly on the entry line pans it
freely.

A value placed **programmatically** — `π`, `e`, or any recall into the edit
window — anchors the other way: the cursor parks in front of the most-
significant digit, so you always see the *head* of the number (`3.14159…`)
with the `…` chip marking where it runs out of room, and the remaining digits
come into view by scrolling or arrowing right. Recalled values carry their
full internal precision (the Internal-digits setting, default 40), not just
the displayed 15 — the entry line is an editing surface, not a display.

**Copying out of the stack.** Tapping a stack number copies *exactly what is
displayed* — notation, rounding and all (`2e+19`, `10E+24`) — and lights the
**CPY** lamp. Tapping the row's **level label** (the small shaded box at the
left, padded into a real touch target without moving the digits) performs a
*deep copy*: every stored digit in canonical text, which is often more than the
display shows; that answers with **FULL** and **CPY**. A clipboard failure answers with
**ERR**, never a confirmation lamp for a copy that did not happen. Copying is
strictly read-only — no pending-entry commit, no `lastX`, no stack motion. The
stack's native text selection is disabled in favor of these actions: touch-hold
anchored wherever the engine felt like, and it could never promise "copies what
you see".

### The copy rail

The level labels are not a one-off control: they are the top of a **column** that
runs down the left edge of both display windows, and the entry line has its half
of it — the same shaded box, directly under `0:`, labelled `e:` (entry line's row
label; copying in full is its extra, unlabeled duty, exactly like the levels).
One gesture
in either place means the same thing: **copy this number in full**. The width is
one variable (`--copy-rail-w`) so the two halves cannot drift out of alignment,
and both windows declare the same 8px inset, so they land on the same x.

The box sits at the left *border*, outside anything that scrolls: panning a long
number sideways never slides it away, and it stays under a finger for a whole
hold. That is what makes it safe to reserve — a target drawn over the digits
would move under the thumb.

**Pasting.** Three routes in, all landing at the cursor:

* **Hold inside the edit line** (mobile) — 450 ms without moving. A drag still
  pans and never pastes; the hold is cancelled by the first move past the pan
  threshold.
* **Ctrl-V / Cmd-V** (desktop).
* The browser's own `paste` event, if it offers one — it carries the clipboard
  with no permission prompt, so it wins whenever it arrives.

Clipboard text is reduced to one legal number before it is inserted: spaces,
commas and letters are dropped, a second decimal point goes, an exponent keeps
its sign (`-1.5e-3` survives whole rather than being repaired into a different
value), and anything with no digits in it is refused with **ERR**. Pasting uses
the same insertion path as typing, so it cannot leave a state no key could have
typed — with one deliberate exception: a paste is *not* treated as a constant.
`π` and `e` anchor the view at their first digit (so you read `3.14159…` from the
head), which parks the cursor at 0; a paste must keep the caret where the user
just put it, so `appendNum` takes an explicit `noAnchor` opt-out.

**Ctrl-C / Cmd-C** copies the edit line — same value as pressing the rail. A real
text selection is left to the browser: over help or menu text a selection is
exactly what the user meant, and our copy stands down for it.

Native selection is now off over **both** display windows. Over the entry line a
drag is a pan, but when the pan ran out of travel — or the finger simply moved
faster than the scroll — the same gesture fell through into a selection
rectangle, drawing blue boxes over an LCD that has no use for them. Copying here
is an explicit action (the rail, a hold, or Ctrl-C/V), so nothing is lost; the
caret never moves as a side effect.

## The menu, settings, and memory

Hold **Fn** — STO's cap relabels to `Menu` — and tap it. The menu takes over
the LCD (stack and entry line hide; the stack itself waits underneath) and is
built from numbered rows you tap, or walk with the softkey strip the top row
becomes: `Exit` `Back` `▲` `OK` `▼`. Every other key dims inert — present,
legible, dead — while the menu owns the display. On a hardware keyboard the
arrows navigate, Enter selects, Escape exits; long lists scroll with a finger.
Nothing is ever dimmed as a promise of future features: if a row is in the
menu, it works.

* **About** — what this is.
* **Preferences** — Display digits (1–30, default 15) and Internal digits
  (8–64, default 40, always at least display + 2): the display width and the
  register width. Internal precision governs arithmetic, typed entries (a
  longer entry rounds to it on ENTER, like typing past a hardware register's
  width), and the π / e constants — they insert exactly the digits that will
  actually be stored. Notation switches Scientific ↔ Engineering (exponents
  in multiples of three: `10E+24`), as does **Stack lines** (3–6) — the pinch
  detent and that setting are the same number. A **Screen** submenu groups the
  look of the glass: **LCD brightness** and **LCD contrast**, five detents each
  with **3 = the factory look** (both filters exactly ×1, today's rendering).
  Tone changes preview live as you move — OK keeps them, Cancel puts them back
  — and dim only the LCD, never the keypad. **Key vibration** (on by default;
  Android only — iOS has no vibration API) ticks once as a key registers.
  The keypad owns its touches (`preventDefault` at `touchstart` — suppressing
  `contextmenu` alone does *not* stop Chrome's long-press haptic, which fires
  at gesture recognition before JS sees anything): Chrome's buzz, menu and
  press-eating cancel all go with it, a hold is just a slow key that
  registers on release, and slide-off cancels silently like any app button.
  The cost — no browser click synthesis or `:active` for touches — is paid
  back from pointer events: a `.pressed` class for the look, a synthesised
  `.click()` on release-inside for the action, coordinate-tracked so sliding
  off lifts the key and sliding back re-arms it.
  Contrast is a true pivot-about-mid-grey (like a hardware wheel), so raising it brightens the field while
  darkening the digits — brightness drifting a little with contrast is the
  real coupling, not a bug to smooth over.
* **Stored settings** — what comes back on the next launch: zoom, angle mode,
  notation, registers, and the stack itself, each with its own remember/on-off
  (all on by default — an app you live in starts where you left it). The
  Welcome screen can be re-armed here, and **Reset all storage** erases every
  stored value *and* clears the calculator to match. Destructive actions use
  the register-Clear idiom, not dialogs: the first `OK` re-arms as a red
  *"OK again to ERASE"*, the second executes.
* **Help** — an in-app guide written for someone who has never used an RPN
  calculator: *Navigating the display*, *Stack usage basics*, *Stack
  manipulation keys*, *Trig, power and log keys*, *Other keys*, *STO / RCL
  registers*, and *Menu and settings*. It is end-user documentation and stays
  that way — no hardware-keyboard chapter (a phone has no keyboard; the
  shortcuts are documented here in the README instead), and its wording is
  checked against the CSS it describes rather than against intent.

### Where the help text lives — `docs.js`

The Help chapters and the About / Welcome copy are plain text in **`docs.js`**,
beside `index.html`; a menu screen names its share of it (`doc: 'h_stack'`).
Editing documentation never touches application code again.

It is loaded by a classic `<script src>` rather than `fetch()`, and that is a
constraint, not a preference: **a page opened straight from disk cannot read a
second file any other way.** Chrome refuses `fetch`/XHR to `file:` URLs, Firefox
gives every local file its own opaque origin (so there is no "same origin" for an
`index.html` and its `docs.md` to share), and Safari differs again — while a
classic script loads from disk in all of them. Two consequences follow, both
documented at the top of `docs.js`:

* the text has to live inside a JavaScript string, so it is wrapped in
  `String.raw\`…\``. Backslashes stay literal (prose can mention a key like `\`);
  **a backtick and `${` must never appear in the copy**, because either one would
  end the string or start a substitution — a parse error whose symptom is every
  help page blank. `docs-test.js` checks for exactly those two, by name.
* the tag must stay a *classic* script: `type="module"` (or `crossorigin`) puts it
  under CORS rules and silently breaks `file://`, invisibly in an `http://`
  preview. The test asserts the tag's shape and that it precedes the app script.

If `docs.js` is missing — not copied, 404s, or absent from a stale service-worker
cache — the calculator still runs and Help says *"Documentation unavailable"*
rather than opening a blank screen; a chapter that exists but was renamed names
its id instead. The two messages differ because the fixes differ.

The markup is a deliberately tiny subset of markdown, because this text gets
edited by hand and every feature a formatter supports is one more thing an
ordinary sentence can trigger by accident:

| in the docs | on the LCD |
|---|---|
| blank line | starts a new paragraph |
| `## Heading` | the underlined section heading |
| `**text**` | **bold** — key names and literals |
| `_x_` | *italic* — variables; needs whitespace or punctuation on the near side, so `x_y` cannot italicise itself |
| `[Help](#h_sto)` | a jump to another chapter (an unknown id renders as plain text rather than a dead link) |
| `[text](https://…)` | an external link, opened in a new tab with `rel="noopener noreferrer"`; any other scheme is refused outright |
| `<br>` | a line break inside a paragraph (the worked examples) |

Raw `<b> <i> <em> <strong> <sup> <sub> <br>` pass through for what the subset
cannot say (`x<sup>y</sup>`, `log<sub>y</sub>(x)`), and HTML entities keep
working — including the `&nbsp;` runs that align the worked examples. Any other
tag, and any tag with an attribute, is escaped and reads as the text typed: the
same rule as the keypad labels' `LABEL_HTML_ALLOWLIST`, guarding against a
future edit going wrong by accident rather than against hostile input.

**Editing the copy never requires touching the test.** Rewriting help text is
ordinary work, so nothing in the default run pins its wording:

```
gjs tools/docs-test.js        # after any edit to docs.js, index.html or sw.js
```

What it checks is everything except the words: `docs.js` still parses (the two
forbidden sequences), the markup subset behaves, every chapter `MENU_TREE` names
exists and no chapter is orphaned from the menu, every internal link in the copy
resolves, nothing renders as leftover markup (`**`, an unrendered link, an odd
asterisk pair that silently stopped bolding), and the `file://` wiring above holds.
All of it inspects whatever the copy currently says, so it stays useful however the
prose is later rewritten.

The one thing that does *not* survive a copy edit is deliberately optional:

```
gjs tools/docs-test.js --golden   # += compare every chapter to frozen html
```

`tools/docs-golden.json` snapshots what each chapter rendered at the commit that
moved the copy out of JS string literals, so it answers "did `md()` change what
readers see?" — the question worth asking while refactoring the formatter. It is
not in the default run because a snapshot of *wording* goes stale the moment anyone
improves a sentence, and making people regenerate it would teach them to stop
believing the test: a check you have to defeat to do ordinary work is a check that
stops being believed. Formatter regressions do not need it either — the unit checks
on the subset (`**` → `<b>`, entity handling, escaping) catch those on their own,
which is what makes demoting the snapshot safe rather than merely convenient.

It runs under `gjs` (SpiderMonkey) rather than a headless browser: pure string work
with no DOM dependency, and Chromium is far more machinery than asserting that `**`
became `<b>` is worth. `docs.js` gets no syntax highlighter and no linter — it is
checked by that test and by reading it.

Because the file is edited on its own schedule, `sw.js` serves `docs.js`
network-first with the cache as offline fallback (a page-navigation request in
essence), and still primes it in `SHELL` so an installed app has help text with no
network. A docs-only edit therefore reaches readers without a `CACHE` bump; a
release that changes code still bumps it as usual.

Under the hood: two validated JSON blobs in `localStorage` (preferences and
remembered session, kept separate so reset is complete and prefs can't smuggle
state). A corrupt or foreign file silently yields defaults — storage is a
convenience, never a startup failure.

### Annunciators and the welcome page

A small lamp row along the top of the LCD shows the current modes,
hardware-style: `DEG`|`RAD` and `SCI`|`ENG` — exactly one of each pair always
lit — plus `ERR`, which blinks whenever an operation refuses. The ENG lamp is
tappable (Fn-EE also flips it), so a quick switch never costs a trip through
the menu, and the lamps stay truthful because they live on the display itself.

The first launch shows a two-line **Welcome**: what the app is, and where the
Help section lives. Deliberately nothing else — a first-run wall of text gets
dismissed unread, and the worked RPN examples belong in Help where they can be
re-read. Dismissing it is remembered; *Stored settings → Welcome screen*
brings it back.

## Keyboard shortcuts

| keys | action |
|---|---|
| `0-9`, `.` | enter digits |
| `Enter` | push to stack |
| `+ - * / ^` | arithmetic |
| `Backspace` | delete left of cursor (whole exponent marker at once) |
| `← →` | move the entry cursor |
| `Delete` / `Shift+Delete` | drop / *n* drop |
| `\` | nip |
| `d` `o` `p` `k` `s` | dup, over, n pick, tac**k**, swap |
| `r` / `Shift+R` | roll down / up |
| `f` / `Shift+F` | rot down / up (flip) |
| `l` | Lst X |
| `w` | depth |
| `%` / `Shift+%` | divide by 100 / multiply by 100 |
| `m` | percent-change (%Δ) |
| `Shift+^` | the degree'th root (`ˣ√y`, the Inv face) |
| `[` / `]` | arm store / recall |
| `0-9` while armed | pick register 0–9 (completes the store/recall) |
| `.` while store-armed | enter / leave clear mode |
| `Backspace` in clear mode | clear all registers |
| `Escape` | cancel an armed store/recall |
| *while the menu is open:* | |
| `↑ ↓ ← →` | move the highlight (both axes drive it) |
| `Enter` | select / commit · `Escape` exits the menu |

(`log_y(x)` and `ENG` are Fn faces — screen only; Shift means Inv on this
keyboard, and the menu itself opens from the STO key's Fn face.)

## Layout and display modes

One column normally; **two columns when the viewport is much wider than tall**
(a phone on its side, a short wide window) — stack history and the scientific
keys on the left, the number pad filling the right. The switch is measured,
not guessed: aspect ratio ≥ 1.3, at least 560 px wide, no taller than 620 px.
Rotating back re-detects automatically; nothing scrolls.

The app measures its own viewport rather than assuming one — safe-area insets
are read live from the browser (camera cutout, status bar, gesture area) and
remembered per orientation, and key height shrinks before anything clips.
Key heights are locked to padding + one line of type: relabelling a key (Fn,
Inv, the store flow) changes what a cap SAYS, never how big it is — only the
viewport and its fit pass can resize the bed.
Installed (`standalone`) it launches with no browser UI and runs offline; in a
browser tab it behaves as a normal page. Long-press (or right-click) the
display for a readout of the detected mode, the insets reported by the browser,
and whether one or two columns were chosen — useful on a device that pads
something it shouldn't.

## Installing

* **Android** (Chrome / Edge / Samsung Internet) — open the URL and use the
  in-app *Install* chip, the address-bar install icon, or menu → **Install app**.
* **iOS / iPadOS Safari** — Share → **Add to Home Screen**.
* **Desktop** (Chrome / Edge) — address-bar install icon, or menu → *Install*.

Once installed it launches full screen with no browser chrome and works with no
network connection.

### Renaming an already-installed app

The label under the home-screen icon comes from the manifest's `short_name`
(`name` is the fallback when `short_name` is absent). Changing it does **not**
rename an existing install immediately:

* **Chrome / Edge on Android** — the label is baked into a *WebAPK* that Chrome
  builds on its own servers. It re-fetches the manifest at most once a day, and
  only requests a new WebAPK after all app windows are closed, the device is
  charging, and it is on Wi-Fi. Expect up to ~24-48h; force it from Chrome at
  `about://webapks` → **Update**. Installing while the old copy is still present
  therefore shows the *old* name.
* **iOS Safari** — the label is read from `<title>` (or
  `<meta name="apple-mobile-web-app-title">`, not set here) and snapshotted at
  Add-to-Home-Screen time. It never updates on its own; delete and re-add.
* **Desktop Chrome / Edge** — updates in place after a manifest re-check plus a
  full app quit, but `icons` are not refreshed.

Because the service worker is cache-first for subresources, an existing install
can also keep serving the *old* manifest; `sw.js` bumps `CACHE` and prunes the
legacy `rpn-calc-*` caches so a fresh copy is fetched. For an immediate result,
uninstall the old app (or clear its site data) before re-installing.

## Files

| file | purpose |
|---|---|
| `index.html` | the whole app: markup, styles, and logic in one file |
| `docs.js` | the Help / About / Welcome copy as plain text in one string — edit this to change the documentation; loaded by a classic script tag so it also works from `file://` (see *Where the help text lives*) |
| `decimal.min.js` | vendored decimal.js v10.4.3 (MIT) — the arbitrary-precision math engine; plain script tag, works from `file://`, cached with the shell so offline installs are unaffected |
| `manifest.webmanifest` | PWA manifest — name, icons, `standalone` display mode; relative paths so it works at a domain root or under a subdirectory |
| `sw.js` | service worker — caches the app shell for offline launches; revalidates `docs.js` instead of holding it until the next code release |
| `icons/` | 192/512 px (`any`), 512 px `maskable`, `apple-touch-icon`, favicon |
| `tools/docs-test.js` | the documentation test — `gjs tools/docs-test.js`; wording-independent by default, with an opt-in `--golden` audit of the formatter. Not part of the app shell, so it is never fetched or cached |
| `tools/docs-golden.json` | frozen html from the commit that moved the copy out of JS string literals; consulted only by `--golden`, and expected to go stale as the prose improves |
| `.nojekyll` | skips Jekyll processing on GitHub Pages |
