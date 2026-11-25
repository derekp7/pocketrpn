/* PocketRPN documentation - the Help chapters and the About / Welcome copy.
   Plain text; the app renders it. Edit this file, not index.html.

   Loaded by a plain <script src> tag rather than fetched, because that is the
   only way a page opened straight from disk (file://) can read a second file:
   fetch() and XHR are blocked there by every engine's own-origin policy, while
   a classic script loads exactly as decimal.min.js does. That single reason is
   what decides this file's shape - the text has to sit inside a JavaScript
   string - and it is why the extension is .js and not .md.

   The wrapper is String.raw`...`, which leaves backslashes alone, so prose can
   mention keys like \ or n\drop without escaping them. Two sequences are still
   JavaScript syntax and must never appear in the copy: a backtick, which would
   end the string, and dollar-brace, which would start a substitution. Either one
   is a parse error that empties every help page, so gjs tools/docs-test.js checks
   for both by name and stops there with the hint if the file will not parse.

   Markup the app understands (rules and rationale at md() in index.html):

     blank line          new paragraph
     ## Heading          section heading
     **text**            bold - key names and literals
     _x_                 italic - variables (needs whitespace/punctuation before)
     [Help](#h_sto)      jump to another chapter; ids are the @names below
     [text](https://..)  external link, opened in a new tab
     <br>                line break inside a paragraph
     <sup> <sub> <b> <i> raw, for what the above cannot say (x<sup>y</sup>)

   HTML entities work as-is (&rarr; &times; &nbsp;). Any other tag is escaped and
   reads as the text typed. '@name' alone on a line opens a document; the name is
   the MENU_TREE key and what links point at, so renaming one moves a chapter.

   Rewriting this copy needs nothing else of you: run gjs tools/docs-test.js after
   editing and it checks structure, links and rendering against whatever the text
   now says. It deliberately does not compare the wording to a stored snapshot -
   see the --golden option in that file for what that comparison is for.
*/
var RPN_DOCS = String.raw`
@welcome
## PocketRPN

This calculator uses an RPN (Reverse Polish Notation) stack: enter the
numbers first, then the operation. New to RPN? The
[Help](#h_navigate)
section (via **Fn** &rarr; **Menu**) starts from the beginning.

@about
## PocketRPN

A stack-based scientific calculator for touchscreens. It installs to your
home screen and works offline.

It keeps far more digits internally than an ordinary calculator, so long
chains of calculations stay accurate instead of drifting. By default it
computes with 40 significant digits internally and displays 15.

Enter numbers first in natural order, then press the operator key.
**Fn** switches keys to related functions, and **Inv** selects
inverse or reciprocal functions.

@h_navigate
All results and feedback appear in the LCD display at the top. It has three
parts: a row of status indicators along the top, a scrollable stack display
(with position 0 at the bottom), and an entry / edit line below it.

## The status line

The status line includes indicators for **DEG** or **RAD** (the units
for trig functions), **SCI** or **ENG** for scientific vs engineering
notation, and **ERR**, which flashes briefly when a key is refused. One
indicator from each pair is always lit.

## The two mode keys

**Fn** and **Inv** change the function of various keypad keys.
**Fn** activates a related function, relabelling the key and turning it
purple, whereas **Inv** selects an inverse or reciprocal function,
highlighting the key edge with a red glow. Both are lock-style keys that
light a small green dot while active and can be used together.

## How many digits you see

The calculator keeps far more digits than it shows &mdash; 40 internally,
15 on the display by default, both set under **Preferences**. A number
switches to scientific notation at two cutoffs, also in
**Preferences**: past _Large &rarr; sci at_ integer digits
(default 15, so a 20-digit integer reads
**1.23456789012346e+19** rather than filling five places with zeros
that were never in the number), or past _Small &rarr; sci at_ leading
zeros (default 5, so 0.00052 stays plain while 0.0000001 reads
**1e-7**). Values inside both cutoffs stay plain, including a decimal
rounded to the display width.

**Engineering** notation (**Fn** on **EE**) keeps exactly these
same cutoffs &mdash; it only rewrites the exponent of anything already
scientific to a multiple of three, and leaves plain numbers plain.

None of this loses anything: recall (**Edit**, **RCL**, **Lst X**)
hands back every stored digit in full, so a value can be examined and put
back unchanged.

The edit window keeps that promise by default &mdash; it shows the whole
number, never an abbreviation. If long runs of zeros are harder to read
than an exponent, **Edit zeros &rarr; sci** changes that: once a
number's placeholder zeros pass the cutoff, recall writes it in exponent
form (**2e+19**) while numbers made of real digits stay written out
(**12345678901234567891**). Every significant digit is still there and
the value goes straight back unchanged; **Off**, the default, never
abbreviates.

## Copying a number out

**Tap a number in the stack** to copy it &mdash; exactly what is
displayed, exponent and all &mdash; and the **CPY** lamp confirms.
**Tap the level number** at the left of the row instead for a deep
copy: every stored digit in full, even the ones past what the display
shows; the **FULL** and **CPY** lamps confirm that one.
Copying never changes the stack or the entry line.

The little box at the left of the **edit line**, under the level
numbers, does the same deep copy for what you are typing &mdash; press it,
or **Ctrl-C**. With nothing typed it copies the top of the stack, so it
is never a dead key. It sits on the edge, outside the scrolling digits, so
it stays put while a long number slides underneath.

## Pasting a number in

**Hold your finger in the edit line** to paste at the cursor, or press
**Ctrl-V**. Only the digits are taken &mdash; spaces, commas and any
other text are dropped, and an exponent keeps its sign, so
**-1.5e-3** arrives whole. It lands wherever the cursor is, not at the
end, and the next digit you type carries straight on from it.

## Pinch to resize the display

The stack display supports finger scrolling, and the entry window scrolls
side to side when it holds more digits than fit. Pinch to zoom cycles the
stack from 3 to 6 rows, with the font size adjusting to match. The LCD panel
itself never changes size, only the type inside it.

## Entering and editing numbers

Numbers you enter appear in the edit line of the display. Editing is done
with **&larr;** and **&rarr;** to move the cursor and **⌫**
to delete to the left; the sign is toggled with **&plusmn;**.

**Tap anywhere in the edit line** to put the cursor under your
finger &mdash; no need to walk it over a digit at a time. Hold either
cursor key and it repeats, so crossing a long number takes one press.
Holding in the edit line still selects the whole number as before.

Long numbers scroll the line left and right, marked with an ellipsis
**&hellip;** at the edge. Moving the cursor auto-scrolls to keep it in
view, and you can also drag the line with a finger.

**C** clears the entry line; **AC** clears the stack as well. Neither
clears the storage registers or any saved settings.

## Three kinds of keys

**Arithmetic keys** (**&divide;** **&times;** **&minus;**
**+** and **xʸ**) take two numbers off the stack and return the
result to position 0.

**Function keys** (**sin**, **log**, **&radic;x**, **1/x** and
their relatives) take one number off the stack and push the answer back,
though a few take two; those are labelled with _x_ and _y_.

**Stack keys** rearrange, copy, or delete the numbers in the stack window
without calculating anything. They sit on the top row of the keypad, and
are covered in the next two sections.

@h_stack
An RPN calculator uses a stack as its working memory. A stack is a list of
numbers where new values are added to one end (**pushed**) and taken off
from that same end (**popped**) in last-in, first-out order. That active
end is called the **top** of the stack.

You never have to say which two numbers to combine: they are simply the top
one and the one below it, so a key only ever has to name the operation.

## Reading the stack display

The stack is displayed bottom-up, like a terminal window. Position **0**,
the logical top of the stack, sits directly above the entry line, with
positions **1**, **2**, and so on stacked upward and labelled along the
left edge. Positions count from the top, so 0 is always the newest number.
When a value is popped, everything above it drops down a slot: what was
position 1 becomes position 0. The stack has no fixed size &mdash; it holds
as many numbers as you need.

## Why use a stack?

On a standard calculator, chaining multi-step calculations means writing
intermediate answers down or juggling memory keys. With a stack, your
intermediate results stay right on screen in the order you created them,
ready for the next operation—or ready to be copied with keys like
**dup** and **over**. There are no brackets to plan out either: the
order you enter the numbers is what fixes the calculation.

## Entering numbers and auto-push

To place a number onto the stack, key it in and press **ENTER**. However,
if you are about to press an operator or function key (like **&times;**
or **&radic;x**), you do not need to press **ENTER** first—any number
in the entry line is pushed onto the stack automatically before the
calculation runs.

For example, instead of entering **2 &times; 3 =**, you press
**2** **ENTER** **3** **&times;**. Pressing **&times;**
pushes **3** for you and immediately multiplies the two numbers.

**ENTER** with an empty entry line does nothing. To copy the number that
is already on top, use **dup**.

## Keys that need two numbers

A key that takes two numbers removes the top two and puts one answer back in
their place, so there is no equals key to press &mdash; the answer appears as
soon as you press the operation. Order matters, and there is only one rule:
the number you entered first is the number used first, exactly as you would
read it out loud. **7 ENTER 2 &minus;** gives 5, while **2 ENTER 7 &minus;** gives
&minus;5, and **60 ENTER 4 &divide;** gives 15. Every two-number key works
that way, including the ones labelled with _x_ and _y_: enter
_x_, then _y_, then the key.

If they go up in the wrong order, **swap** exchanges them before you press
the key. If the stack holds only one number to begin with, the key is refused
and **ERR** flashes.

## Orange highlight &amp; cursor placement

When position 0 holds the result of a calculation, its row highlights in
orange; values pushed with **ENTER**, recalled from a register, or moved
by stack keys stay unhighlighted.

A value placed in the entry line that is too long to fit &mdash; **&pi;**,
**e**, or a recall &mdash; shows its leading digits with the cursor at the
far left, so you see the start of the number rather than its tail.

@h_stackkeys
The top row of buttons moves numbers around the stack without doing any arithmetic with them.
Each key below is shown as "before &rarr; after", reading from deeper in
the stack to the top, so the rightmost number in each group sits at
position 0.

## The plain keys

**dup** copies position 0.<br>
5 &rarr; 5&nbsp;&nbsp;5. Useful when a number is needed twice:
**9 dup &times;** gives 81.

**over** copies from position 1 and inserts it into position 0.<br>
3&nbsp;&nbsp;7 &rarr; 3&nbsp;&nbsp;7&nbsp;&nbsp;3. Keeps a deeper number in
reach while you work with the top one.

**swap** exchanges position 0 and position 1.<br>
3&nbsp;&nbsp;7 &rarr; 7&nbsp;&nbsp;3. Fixes two numbers entered in the
wrong order.

**roll&darr;** moves every number down one slot, wrapping the old
position 0 around to the deepest end of the stack (**Inv** gives
**roll&uarr;**, moving in the opposite direction).<br>
1&nbsp;&nbsp;2&nbsp;&nbsp;3 &rarr; 3&nbsp;&nbsp;1&nbsp;&nbsp;2. Brings a
deeper number to the top without disturbing the order of the rest.

**drop** deletes position 0.<br>
4&nbsp;&nbsp;9 &rarr; 4.

## Under Fn and Inv

**nip** (**Fn** on **dup**) deletes position 1 instead of position 0.<br>
4&nbsp;&nbsp;9&nbsp;&nbsp;2 &rarr; 4&nbsp;&nbsp;2.

**tuck** (**Fn** + **Inv** on **dup**) copies position 0 and
inserts the copy between positions 1 and 2.<br>
3&nbsp;&nbsp;7 &rarr; 7&nbsp;&nbsp;3&nbsp;&nbsp;7.

**n pick** (**Fn** on **over**) copies the number at a given
position up to position 0. Enter the position number first: it is consumed,
and a copy of that slot is placed on top.<br>
8&nbsp;&nbsp;3&nbsp;&nbsp;5&nbsp;&nbsp;2 &rarr;
8&nbsp;&nbsp;3&nbsp;&nbsp;5&nbsp;&nbsp;8 (position 3 held 8, and the 2 was
consumed by **n pick**).

**rot&darr;** and **rot&uarr;** (**Fn**, and **Fn** + **Inv**,
on **swap**) roll only the top three numbers, leaving anything deeper
untouched &mdash; a short **roll&darr;**.<br>
rot&darr;: 9&nbsp;&nbsp;1&nbsp;&nbsp;2&nbsp;&nbsp;3 &rarr;
9&nbsp;&nbsp;3&nbsp;&nbsp;1&nbsp;&nbsp;2. rot&uarr; puts it back.

**n roll&darr;** and **n roll&uarr;** (**Fn**, and **Fn** +
**Inv**, on **roll&darr;**) roll only the top _n_ numbers; the
count is consumed first.<br>
1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;4&nbsp;&nbsp;3 &rarr;
1&nbsp;&nbsp;4&nbsp;&nbsp;2&nbsp;&nbsp;3 (rolls the top three and leaves 1
in place).

**n drop** (**Fn** on **drop**) deletes _n_ numbers at once;
the count is consumed first.<br>
7&nbsp;&nbsp;8&nbsp;&nbsp;9&nbsp;&nbsp;2 &rarr; 7.

**depth** (**Fn** + **Inv** on **drop**) pushes the current
number of stack levels onto position 0.<br>
4&nbsp;&nbsp;9 &rarr; 4&nbsp;&nbsp;9&nbsp;&nbsp;2.

## Edit

**Edit** pulls position 0 down into the entry line, off the stack, where
you can move the cursor and correct digits; **ENTER** puts it back. It
comes across at full internal precision rather than the rounded digits on
screen, so nothing is lost while you work on it.

Edit always takes the newest number, so a number still in the entry line goes
up onto the stack first and comes straight back down again: nothing you have
typed is ever discarded, and **Edit** makes no visible change until the
entry line is empty.

## Lst X

**Lst X** (**Fn** on **Edit**) recalls the value that sat at
position 0 before the last calculation.  It loads into the entry line
so you can adjust it as needed and recalculate:

**3 ENTER 8 &times;** gives 24. Pressing **Lst X** brings back 8,
which you can reverse with **&divide;** giving 3, then **Lst X** brings
back 8.
Now you can repeat the calculation with **+** instead.

Only calculations update **Lst X**; copying, rolling, and dropping leave
it unchanged.

@h_trigpow
Each of these keys has up to four labels: the one printed on it, one under
**Fn**, one under **Inv**, and one with both. Most work on stack position 0
and put one answer back; keys labelled with both _x_ and _y_ use
position 1 and position 0.

## Trigonometry

**sin**, **cos**, and **tan**, with inverse functions **asin**,
**acos**, and **atan** under **Inv**; hyperbolic functions
**sinh**, **cosh**, and **tanh** under **Fn**; and inverse
hyperbolic functions **asinh**, **acosh**, and **atanh** with
both.

The angle unit is set by **Deg / Rad**: degrees (360 in a full turn) or
radians (2&pi; in a full turn). The active unit shows at the top of the
display as **DEG** or **RAD**.

## Powers and roots

**&radic;x** square root, **x&sup2;** squared (**Inv**),
**&#8731;x** cube root (**Fn**), **x&sup3;** cubed (**Fn** +
**Inv**).

**1/x** reciprocal: 1 divided by the number. Under **Fn** it is
**n!**, the factorial &mdash; **5 n!** is
5 &times; 4 &times; 3 &times; 2 &times; 1 = 120.

## The x<sup>y</sup> key and its two partners

Each of these three faces solves for one of the unknowns in
_x_<sup>_y_</sup> = _result_. Enter _x_ first, then
_y_, then the key.

**x<sup>y</sup>** &ldquo;x to the y&rdquo;: **2 ENTER 3 x<sup>y</sup>**
gives 8.<br>
**<sup>x</sup>&radic;y** (**Inv**) &ldquo;the xth root of y&rdquo;:
**3 ENTER 8 <sup>x</sup>&radic;y** gives 2, because 2 &times; 2 &times; 2
is 8.<br>
**log<sub>y</sub>(x)** (**Fn**) &ldquo;log of x to the base y&rdquo;:
**8 ENTER 2 log<sub>y</sub>(x)** gives 3, because 2 to the power 3 is
8.

## Logarithms and exponentials

**ln** natural logarithm, **e<sup>x</sup>** (**Inv**) _e_
raised to the power of the number, **&Gamma;(x)** (**Fn**) the gamma
function, which extends factorials to non-whole numbers, and
**inv&Gamma;** (**Fn** + **Inv**) its inverse.

**log** logarithm base 10, **10<sup>x</sup>** (**Inv**) 10 raised
to the power of the number, **log<sub>2</sub>** (**Fn**) logarithm
base 2, and **2<sup>x</sup>** (**Fn** + **Inv**) 2 raised to the
power of the number.

The **Inv** labels undo their partners: **ln** followed by
**e<sup>x</sup>** returns the original number.

@h_other
## Percent

**%** divides by 100: **50 %** gives 0.5. **&times;100** (**Inv**
on **%**) multiplies by 100, undoing it exactly.

To take a percentage of a number, convert the percent and multiply. For 18%
of 240, type **240 ENTER 18 % &times;**.

## Percent change

**%&Delta;** (**Fn** on **%**) gives the percentage change between
two values, with the old value entered first and the new value entered second. Some
calculators label this key % CHG.

**30 ENTER 45 %&Delta;** gives 50. A decrease comes out negative:
**45 ENTER 30 %&Delta;** gives &minus;33.33.

## Pi and e

**&pi;** enters pi, and **e** enters Euler's number (used with natural
logarithms). Both act like typed numbers, so the value placed in the entry
line can be edited further.

Both load with full internal precision &mdash; more digits than the display
can show at once. The **&hellip;** marker and sideways scrolling reveal
the rest, and every digit is kept.

## EE &ndash; Enter Exponent

**EE** stands for &ldquo;times ten to the power of&rdquo; and lets you
enter very large or very small numbers without typing strings of zeros. It
inserts a small **e+** into the entry line, and the digits typed after it
become the exponent.

**2 EE 3** is 2000. For 0.00006, type **6 EE&minus; 5**.
**EE&minus;** (**Inv** on **EE**) starts a negative exponent, and
also flips the sign of an exponent already entered.

**ENG** (**Fn** on **EE**) toggles between scientific and
engineering notation. Scientific notation puts one digit before the decimal
point; engineering notation forces the exponent to a multiple of three
(such as 10E+24 or 12.3E&minus;9), matching unit prefixes like kilo-,
milli-, and micro-. The active mode shows at the top of the display as **SCI** or
**ENG**, and tapping **ENG** toggles it.

@h_sto
The ten registers (**0**&ndash;**9**) are named slots for keeping a
number &mdash; a constant in a long calculation, or an answer not yet ready
to use. They are separate from the stack and unaffected by values being
pushed and dropped.

## Storing

**STO** followed by a digit key copies stack position 0 into that register
(pushing any number in the entry line first). The value stays on the stack;
storing copies rather than moves.

## Recalling

**RCL** (**Inv** on **STO**) followed by a digit key loads that
register into the entry line, where it can be checked, edited, pushed with
**ENTER**, or used immediately by pressing an operator key.

## Which registers hold a value

While **STO** or **RCL** is waiting for a digit, each digit key shows a
corner marker reading _Sto_ or _Rcl_. Orange means the register
holds a value, and grey means it is empty &mdash; so a **RCL** that
appears to do nothing was aimed at a grey register.

## Clearing

While **STO** is waiting, **.** shows a _Clear_ marker: press
**.** then a digit to empty that single register, or press **⌫**
(marked _Clear All_) to empty all ten.

**AC** does not clear registers &mdash; it clears the stack, while
stored values remain. These settings persist between app restarts, which
can be controlled under
**Menu** (**Fn** on **STO**) &rarr; **Preferences** &rarr;
**Stored settings**.

@h_menu
The **Menu** is opened with **Fn** then **STO**, which is relabelled
**Menu** while **Fn** is on. It takes over the display while the stack
waits underneath until you leave.

The top row of the keypad becomes five softkeys: **Exit**, **Back**,
**▲**, **OK**, and **▼**. Tap a line directly to open it, or move
with **▲** and **▼** and press **OK**. Screens longer than the
display scroll by dragging; subpages also carry a **&lsaquo; back**
heading. When editing a setting &mdash; typing a number, or moving a
choice with **▲** and **▼** &mdash; nothing is stored until you press
**OK**, and **Back** reads **Cancel** there because leaving
discards the change.

## Preferences

**Display digits** (1 to 30) sets how many digits are shown.
**Internal digits** (8 to 64, never fewer than display digits plus two)
sets how many digits every number keeps internally; those extra guard digits
keep long chains of calculations accurate instead of drifting. Changing
either setting affects new calculations &mdash; existing stack values keep
the precision they were computed at.

**Notation** switches between scientific and engineering notation.
**Large &rarr; sci at** and **Small &rarr; sci at** set when a number
switches to exponent form: the first is the most integer digits a plain
number may occupy, the second the zeros tolerated after the decimal point
before a small number goes scientific. Both notations honour the same
cutoffs &mdash; engineering only rewrites the exponent of anything already
scientific. **Edit zeros &rarr; sci** is separate: it lets a recall into
the edit window write an exponent once placeholder zeros pass the cutoff
(turning 20000000000000000000 into **2e+19**), and defaults to
**Off**, where recall always spells every digit out.

## Screen

The **Screen** submenu holds how the glass looks. **LCD brightness**
and **LCD contrast** are five-step controls, and **3** on each is the
factory look: level 1 dims or fades, level 5 brightens or sharpens. Move
with **&#9650;** and **&#9660;** to preview the change right away,
**OK** keeps it, **Cancel** puts it back. Only the display dims &mdash;
the keypad stays as it is.

**Stack lines** (3 to 6) lives here too; it mirrors pinching the display,
so the two always stay in sync.

## Key vibration

When **On**, each key gives a short tick the moment it is
pressed. Sliding off a key cancels it &mdash; silently, like any
app button &mdash; and holding one down is just a slow press:
it registers when you let go. Phones without vibration support
(including iPhone) have no way to feel this and stay quiet.

## Stored settings

Individual switches control what the calculator remembers across sessions:
display size, degrees or radians, notation, registers, and the stack.
Turning an item off starts it fresh on next launch.

**Welcome screen** re-enables the first-run page. **Reset all storage**
erases every saved setting, register, and stack value on this device and
resets the calculator; it requires **OK** twice.

## Status indicators and ERR

**DEG** or **RAD** shows the active angle unit, set with
**Deg / Rad**. **SCI** or **ENG** shows the active notation (see
**EE** under **Other keys**); **ENG** (**Fn** on **EE**)
toggles it directly without opening the menu. One indicator from each pair
is always lit.

**ERR** flashes briefly when a key is refused &mdash; such as taking the
square root of a negative number or dividing by zero &mdash; leaving the
stack completely unchanged.
`;
