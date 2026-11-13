# Decisions

Newest at the bottom. Each entry: what we decided, and why.

**2026-10-24: Host on GitHub Pages with Firebase as the database.** Mom and sister don't have Claude accounts, so a Claude Artifact won't work. GitHub Pages is free but static; Firebase's free tier stores the shared data. Chosen over Google Sheet + Apps Script because Claude can push and deploy everything directly. Supabase was rejected because free projects pause after about a week of inactivity.

**2026-10-24: Real sign-in, not a name picker.** The surprise is the point. A name picker can be misclicked, and the hidden data could be read from the browser. Firebase Auth plus security rules keep each person's gifts away from them on the server.

**2026-10-25: Google sign-in for Brady, Allie and Kevin; email-link sign-in for April.** April's email is @me.com (Apple). Sign in with Apple needs a paid developer account. April signs in once per device and then uses a bookmark.

**2026-10-25: Desktop browsers first.** Must not break on phones, because links get texted, but phone polish is out of scope for v1.

**2026-10-25: Vite + React + TypeScript.** Common, well-documented and fast to build. TypeScript catches mistakes as code changes across many sessions.

**2026-10-25: Feature test.** Every feature must beat a Google Sheet and add something Giftster doesn't. See principles in `CLAUDE.md`.

**2026-10-25: Public repo.** Required for free GitHub Pages. No emails or family data in the repo.

**2026-10-25: Push straight to `main`, no pull requests.** Brady doesn't review code line by line, so merging was a rubber stamp. The real check is trying the live site. Git history keeps every change reversible. Revisit at family launch.

**2026-10-25: Design direction (provisional).** Snow globes for the home screen; a "Christmas morning" look for list and shopping pages. Chosen over a movie-theatre concept and round-one generic styles because it's built from the family's own traditions. Not locked: fonts, colors and layouts get refined in M3. See `DESIGN.md`.

**2026-10-25: Not building "tag says / really from".** Deciding which gifts say "From: Santa" happens late, at wrapping time, so tracking it weeks ahead isn't practical. The "guess what's in the box" bubble was dropped too: random, no value.

**2026-10-25: Styles: one theme file plus a CSS file per component.** Tokens are CSS variables in `src/theme/theme.css`. Each component has its own `.module.css` file, so styles can't leak between features. No styling library: plain CSS is easiest for Brady to read.

**2026-10-25: Deploy only from a passing build.** GitHub Actions builds (including the TypeScript check) on every push to `main`; the deploy job runs only if the build succeeds.

**2026-10-25: Design direction: quiet paper, one snow globe.** Replaces the plaid "Christmas morning" look, which Brady found busy. Cream paper and ink; lists separated by lines and space, not boxes; one red main button per screen; pine for done. The only illustration is the person's snow globe: on a shopping page, gifts pile up inside it as they're planned, bought and wrapped. Round 3 mockups were rejected as busy and shopper-only.

**2026-10-25: One display font, Gloock.** Body text is Nunito Sans. Caprasimo and Caveat are dropped.

**2026-10-25: Two kinds of wish: "Gimme, gimme, gimme" and "Maybe an idea…".** From Brady's sketch. A specific item is claimed once. A "Maybe" (a store, brand or kind of thing) stays open, and several people can each add a gift under it, seeing what's already planned so nobody doubles up. Easier for April than naming exact products.

**2026-10-25: Paste-anything intake.** Paste one link or a whole list; each line becomes an item, named from the link, with any text after the link kept as the note. Runs in the browser, no server. Full auto-fill (photo, price) stays in the backlog.

**2026-10-25: Stockings are a place, not a section of their own.** Every gift goes "under the tree" or in the "stocking". No Santa pile: which gifts say "From: Santa" is decided at wrapping time.

**2026-10-25: Naughty/Nice is decoration that Brady sets.** Nobody changes it on the site. In the prototype it lives in the sample data; from M4 Brady edits it in the database. Not a nudge to make a list: everyone's an adult.

**2026-10-25: Personal details stay out of code.** Pets and inside jokes go in the database. Prototype globes are a generic tree scene; personal scenes come later.

**2026-10-25: Prototype "Viewing as" switch.** Until sign-in exists (M4), a bar at the top lets Brady act as anyone. The data layer already hands each person only what they're allowed to see, matching the M5 rules.

**2026-10-25: No prices from the person adding, no manual ranking.** Typing prices onto your own list felt tacky. Shoppers enter what they paid when they claim something; pulling prices from links is in the backlog. Order is just favorites (stars) first, then newest last; no arrows or dragging.

**2026-10-25: Wishes of the "Maybe an idea…" kind are tagged "Idea" in lists.**

**2026-10-26: Quiet rows, details on click.** Two busier list designs were rejected ("I'd rather just have a spreadsheet"). Every row is one line: status pill, name, who. Color only means status. Notes, links, price paid and shipping show when a row is opened. Modeled on how well-made list apps work.

**2026-10-26: One list per person, in their order.** No split into "needs someone" and "covered", and ideas sit in the same list. Each row shows its own state.

**2026-10-26: No "new" markers or counts.** Lists get filled in mostly at once, and claims show live, so "new since you looked" and gift counts were noise. Counts also invited comparing people. The gift pile in the snow globe stays on shopping pages only.

**2026-10-26: Status colors.** Open grey (dashed circle), Planned amber (empty circle), Bought green (full circle), Wrapped red (present). Shape and word always go with the color.

**2026-10-26: Shipping on gifts.** Brady ships from DC to Richmond. A gift can ship to someone else's house (never the recipient's) with a tracking number that links to UPS, USPS or FedEx by its format, then be marked arrived. Live tracking needs a paid service: backlog.

**2026-10-26: Home is the night sky.** The M1 sky and sleigh, with "Add to my list" as the first thing you see and globes with names only below.

**2026-10-26: "An idea…" with a lightbulb.** Replaces "Maybe an idea…" and the dotted present, which read as a riddle. The lightbulb is a common symbol, but here clarity wins.

**2026-10-28: One button on Home: "Add to my list".** "See my list" went to the same page, and two buttons that do the same thing confuse more than they help. "My list" is still in the top bar.

**2026-10-28: Home is a screen print of the house.** Replaces the night sky and sleigh (still available behind the `housePrint` flag). The style is inspired by a printmaker the family loves: flat inks, hard edges, colored shadows. ChatGPT drew the house from street photos and the prints (hand-written SVG couldn't get close); a local script then reduced it to 16 flat inks, tapered the oak's branches so the sky meets the headline cleanly, and traced every ink into vector shapes for crisp, stencil-like edges. Phones get a tall version, wide screens a landscape one, both in the same inks. The headline sits on the picture's own sky. The house picture is fine in this public repo because it has no house number, signs or street names.

**2026-10-28: Santa's sleigh flies over the house print.** A flat silhouette in the oak's ink, in a layer masked to the print's sky, so it passes behind the tree, the roof and the chimney. One slow pass every 45 seconds; on phones it swoops from above the treetop toward the chimney. With reduced motion it waits over the roof. The headline moves into the picture only from 1200px wide, so the sleigh never crosses it.

**2026-10-28: Snow globes in the print's inks.** The globes now hold the same dusk as the house print: flat sky bands, a dark tree with snow on its tiers, a hard highlight on the glass, a two-tone base. The gift pile keeps its meaning. A `scene` slot lets a personal scene replace the tree later (from the database). Brady kept the sleigh dark: subtle but obvious enough.

**2026-10-28: Wide house print redone at 16:9 with the whole oak in frame.** The first wide version's branches ran off the top and had to be trimmed, which left stubby tips. ChatGPT pulled the view back so the crown ends in clear sky; same 16 inks, tracing and sky mask as before. The headline sits right of the tree, and the shopping globes now peek in on a laptop's first screen.

**2026-10-28: Less bookkeeping, from Brady's click-through.** The site shouldn't ask people to keep records up to date.
- **No prices.** Typing what you paid felt tacky. Gone from the pop-up and the rows.
- **No tracking numbers or "Arrived".** Nobody would come back days later to add them. Shipping is now one choice made once, "Shipping somewhere?", and shows right after the gift's name ("Wool beanie · to April's") instead of a truck icon next to the giver, which read as "shipping to that person".
- **Houses, not people.** Allie and Kevin share "Allie's". A gift never ships to the recipient's house, so Kevin can't ship Allie's gift home.
- **Gifts can have a link.** Paste a link where the name goes and it's named from the link, like the wish list. Notes and links show under gifts without opening anything.
- **Overheard is one line per note:** what was heard, who heard it, and "Make it a gift". No dropdown arrow and no date. Overheard is notes, not plans: nobody's getting those things yet. Surprises are gifts someone is getting.
- **Download everything as a spreadsheet,** on Home, behind the `spreadsheetDownload` flag. Everything you're allowed to see, nothing about you.
- **Gold star** replaces "One of my top picks". Pop-up wording talks to Santa ("anything Santa should know", "Help Santa choose"); "a kind of thing" is gone.

**2026-10-28: A gift is bought or not.** "Planned" and "Wrapped" weren't real states: someone's getting it (their name says so), and it's bought or it isn't. Rows show Open, Not bought or Bought; on your own gifts the pill is a one-tap switch, so there's nothing to open. Replaces the 2026-10-26 four-status decision.

**2026-10-28: Type pass.** Fifteen text sizes became one scale of seven, and bold stopped being the default: row names are semibold, who's getting it and hints are regular, only buttons and pills are bold. Headings wrap evenly. Guided by the ui-ux-pro-max rules (consistent scale, weight follows hierarchy).

**2026-10-29: Two states, one tap.** A wish needs a Santa or Santa's got it. "I'll be Santa" covers it in one tap; there's no later "bought" step to remember. Gifts carry no status at all: being on the page means someone's getting it. Undo is Change → Remove. Replaces the 2026-10-28 bought/not-bought decision. Words live in `src/shared/format.ts`; alternatives considered: "Up for grabs / In the sack", "On the list / Checked off".

**2026-10-29: First personal globe: two cats in April's.** Made like the house print (ChatGPT, then the flat-ink pass and tracing). The picture is in the repo with no pet names anywhere; which globe shows it is data (`globeScene` on the person: sample data now, the database from M4). Scenes are square, with no glass, base or falling snow (the globe draws those), and the subject sits above the bottom quarter, where gifts pile up.

**2026-10-29: Fresh-eyes UX review: everything in view, fewer steps.** A review of the live prototype, judged by "could April do this without calling Brady?" Brady approved all of it.
- **Rows show everything; nothing opens.** Notes and links sit in small type under each name. The size or color someone asked for is the shopping information, and it was hidden behind a small arrow. Replaces "details on click" (2026-10-26); rows are still one thing each, with color only for status.
- **Your gifts say "You · Change" in the row.** Undoing an accidental "I'll be Santa" took four hidden steps; now it's Change, then "Not getting it". Only your own gifts show Change.
- **"Put someone else down for this" is gone.** I'll be Santa, then Change, does the same.
- **Gifts under an idea are listed under it,** with "Add another gift".
- **One pop-up pattern for adding.** Gifts start with "Link, or what it is", like your own list; a pasted link brings up a Name box. The second Link box is gone.
- **Overheard notes move into gifts.** "Make it a gift" puts the words in the gift's notes and leaves the note out of Overheard and the spreadsheet, instead of naming the gift with the whole sentence and listing it twice.
- **Smaller fixes:** short share links (a.co, amzn.to) take their name from the words pasted with them; a new wish scrolls into view and lights up; faint text and text-box edges meet contrast minimums (4.5:1, 3:1); "Change" everywhere instead of "Edit"; pop-ups sit near the top so they don't jump.
- **Phones:** names get the whole width and wrap instead of being cut off; status and who go on the line under.

**2026-10-29: The print carries through every page (Round 8, concept A).** The house print stopped at Home, so the pages people use looked like a generic list app. Chosen over concept B (quiet paper with the print's ink colors, globe leading each page) because a globe that stays in view turns the gift pile into feedback: every "I'll be Santa" visibly lands in the person's globe. Built with five refinements over the mockup: the globe only follows you when there's room for two columns (960px and up), narrower screens get a slim bar, Home's snow section uses the same paper as every other page, My list's globe stays still (nothing lands in your own), and presents only drop when added while you watch (none on page load, none with reduced motion). The add buttons became flat ink blocks and the tilted Santa's list sticker a flat gift tag, the two most template-looking pieces. Inspired by Stripe Press (each book its own world, one system) and Things 3 (quiet rows, one satisfying moment). Mockups: Round 8 on the canvas.

**2026-10-29: Modern web practices across the site (Google Chrome's Modern Web Guidance).** Checked the site against its guides and kept only what changes something for this family:
- **Layout follows text size, not just screen width.** List rows and My list's add blocks lay themselves out by the room they have (container queries in rem); page layouts switch at widths in em. With larger text, things rearrange instead of squeezing or breaking "Gimme, gimme, gimme".
- **The phone's own text size applies** (`<meta name="text-scale">`). April's iPhone text setting now carries into the site; everything was already sized in rem, so it scales cleanly.
- **Pop-ups don't close on a click outside.** A stray click or a text-selection drag ending outside lost what was typed, like a pasted list of links. X, Cancel and Esc close them. The page behind no longer scrolls, and pop-ups fade in.
- **Save buttons are never greyed out.** A grey button did nothing and said nothing; now an empty required field gets the browser's own "Please fill out this field".
- **Keyboard focus stays put** after "I'll be Santa" (it moves to the row's new "Change").
- **Reduced motion is handled per animation** (snow, gift drop, sleigh, pop-ups) instead of one global rule that cut every animation to near zero.
- **Smaller:** Home's print loads first (`fetchpriority`), fallback fonts are scaled to ours while they load (`font-size-adjust`), paragraphs avoid lone last words, link fields don't autocapitalize, and solid-color buttons keep an edge in high-contrast modes.
- **Not done:** dark mode, skip links and scroll-state sticky effects. Nothing in them helps this site now.


**2026-11-05: M4 data layer: Firebase behind one switch.** `realSignIn` in `src/config/features.ts` picks the database: off is the prototype (browser storage, sample data, "Viewing as" bar); on is Firebase sign-in and Firestore. Both sit behind one small interface in `src/data/backend.ts`, so pages didn't change. Pages show only once everything has loaded, so nobody sees a half-filled list.
- **The family list lives in the database.** A `members` collection, one document per email, says who each signed-in person is. Brady types it in the Firebase console, so no email is ever in the public code. Anyone not on it sees "This list is just for the family".
- **The hiding rules came in M4, not M5.** The site's reads had to be built around them anyway ("every gift not for me"), and real gifts should never be readable by the person they're for, even through developer tools. `firestore.rules` is tested as each person against Firebase's local emulator (`npm run test:rules`); M5 becomes testing on the real site as each person.
- **Nothing stays on the device.** The database keeps its copy in memory only, not in the browser's storage, so on a shared computer the next person can't dig up the last person's surprises.
- **Globe pictures stay in the code; who gets which is data.** A person's `globeScene` is a picture's name (`two-cats`). Firebase's file storage now needs a paid plan, and the pictures have no names or places in them.
- **Sign-in:** Google opens in a pop-up (the redirect kind is unreliable when the site and Firebase live on different domains). An email link opened on another device asks for the email again, as Firebase requires.

**2026-11-05: Sign-in emails stay as Firebase sends them.** The link email lands in spam (a generic `firebaseapp.com` sender). Brady judged that April can check Junk, and she needs it only once per device. Sending through Brady's Gmail (Firebase's SMTP setting) is the fix if that proves wrong.

**2026-11-10: Launch with the plain sign-in page.** Brady wants the family using the site now; a designed sign-in page is beautification, not day-one function. Parked in BACKLOG with Brady's idea (matching pajamas on Christmas Eve and Christmas Day).

**2026-11-10: Signing in needs proof, not just an email typed in.** Brady asked whether typing your email could be enough. Claude recommended against and Brady didn't overrule: anyone who typed another person's email would see that person's view, including their own surprises, and the site's address and code are public, so a stranger could too. The database rules can only protect gifts if they know who's really asking. It costs one email per device; the site then stays signed in until you sign out. If April struggles with the link, the fallback is an email and a password of her own (Brady creates it in the console).

**2026-11-10: M5 is its own step, not folded into launch.** Claude had moved M5 into the launch without asking; Brady caught it. M5 is: tighter rules, then a real-site check before the family starts.
- **Tighter rules.** Gifts and overheard notes must be about a real person (a gift for "April" instead of "april" would be about nobody, so April could read it), from a real person, never to yourself, shipped only to a real house, with only the fields the site writes. Wishes and notes likewise. 20 rule checks pass, and the site's whole click-through still passes under them.
- **Checking the real site as April, without April.** Gmail delivers `you+april@gmail.com` to your own inbox, but Firebase treats it as a different email. A temporary `members` entry maps that address to `april`, so Brady can sign in as April by email link and look for her surprises. The entry and the test records are deleted afterwards.

**2026-11-10: Pre-launch review: a short list, built around Brady's shopping.** A review asked what would make December clearly better than the old spreadsheets. Brady kept seven items (the build plan in `STATUS.md`) and turned the rest down.
- **"Santa's sack" (Round 9, concept A): a page of its own, by person.** Everything you're getting, grouped by who it's for, with the size or link from their wish and where it ships. Chosen over sorting by house (answers "what's in each box", asked less often) and over putting it on Home (pushes the globes down). The shelf holds a small flat-ink picture of Santa's sack (`docs/design/santas-sack.svg`), which Brady liked in the mockup. Your own globe was tried there and dropped: it made the page look like My list.
- **"Landing at your place" is part of that page.** It's the only place the person receiving a box can see what's coming and who it's for. First on the page when it has anything, left out when empty.
- **Shipping is mostly Brady's.** The others order to their own house. So the site asks "Shipping it to April's?" after a claim only for someone who has shipped a gift before, and never preselects it.
- **Everyone can change any gift they can see.** Brady enters gifts for others and needs to fix them. The rules already allowed it. Replaces "only your own gifts show Change" (2026-10-29).
- **A gift from someone's list can go in a stocking.** It was always saved as under the tree.
- **Two claims on one wish both show.** Two people tapping at the same moment both saved a gift, and the row showed one.
- **Spreadsheet rows paste into "Gimme, gimme, gimme".** Replaces the one-time import in BACKLOG.
- **The last generic looks come out:** soft pop-up shadows, round pills, the raised Home button, hover lifts. Flat ink and hard edges, like the print.

**2026-11-10: Not building, from the same review.**
- **Wrapping night, printed gift tags, Christmas morning.** The family loves wrapping and organizes it themselves. Still no tracking of "From: Santa".
- **A first-visit welcome or a guided tour.** Three kinds of page with one main button each don't need one; tours break when layouts shift and need upkeep. Brady's text to the family is the introduction.
- **"New since you looked" markers.** The 2026-10-26 decision stands. The one costly case, a wish removed after you claimed it, shows in Santa's sack.
- **Prices and link auto-fill.** The price is one click away on the link; auto-fill needs a separate service that Amazon blocks. Cut, not parked.
- **A password for April now.** Stays the fallback (see the sign-in entry above), with one more reason to watch: Safari on iPhone clears a site's saved sign-in after about a week without a visit.

**2026-11-10: Building the pre-launch plan: small calls made on the way.** All seven steps are built as specified; these are the details the plan left open.
- **Two Santas on one wish:** the names stack, one per line, each with its own Change. Each gift's note shows under the wish, and "to April's" shows once even if both ship there.
- **Santa's sack is switched on** (`santasSack: true`), since the site isn't launched yet. Its globe sits beside each "For <Name>" heading through a new `lead` slot on `ListSection`. Under 960px the sack picture is left out, as the plan says, and the heading and its line sit centered, as on My list.
- **The gift pop-up lives in `src/shared/GiftDialog.tsx`** with its own small style file, so shopping pages and Santa's sack share it.
- **"Shipping it to April's?"** goes away once the gift has shipping, however it was set (Yes, or the pop-up). "Most recent" means the gift added most recently.
- **Pasted spreadsheet rows:** a header row is skipped only when it's the first line and has tabs; cells are trimmed, and a row that's only a link is named from the link.
- **Step 7:** `--plaid-red-shadow` is no longer used (Home's button lost its shadow); kept in the theme so the change is one line to undo.
- **Review screenshots** are now taken by `tools/review/take-screenshots.cjs`, so the next retake is one command.

**2026-11-10: How M5 tests the real site.**
- **One script, two places:** `tests/live-site.e2e.cjs` runs the same checks on the emulator (default) and on the real project (`TARGET=live`). Admin calls live in `tests/live/admin.cjs`. Brady and April open the sign-in link where they asked for it; Allie and Kevin open it "on another device" and type their email, so both paths get tested. April runs at 390px wide with text at 120%.
- **Safe on real data:** test accounts are `m5-test-<person>@example.com`, mapped by temporary `members` entries. Everything the test makes starts with "TEST M5". Cleanup deletes only records that weren't in the before snapshot and carry the mark, then compares every record, including its last-changed time, with the snapshot. It stops at the start if an earlier run left anything behind.
- **Doesn't spoil Brady:** Brady is shopped for too, so the test never prints or screenshots real records about anyone. It reports counts and a fingerprint per collection, and failures about real records say "a real record". Snapshots, spreadsheets and screenshots go to a temp folder, never the repo.
- **Cloud sessions can't use gcloud for Firebase:** the session's proxy swaps Google's access token for a placeholder, so even `gcloud` itself is refused. The live run happens on Brady's computer.
- **Not tested by fake accounts:** the Google button (Brady uses it on the live site, so it works) and the "Email me a sign-in link" button (it would send a real email to a made-up address).
- **Fixed: an old sign-in link was a dead end.** On another device, an old or used link said "Send yourself a new one" with no way to do it, and reloading kept the old code. Now it says "That link didn't work" with one button, "Send a new link", that goes back to the plain sign-in page.

**2026-11-10: Sign-in is your email and the family password (M5 finished).** Brady said yes to the plan in `M5-PLAN.md`.
- **What changed:** the email link is gone; the sign-in page asks for "Your email" and "Family password", with "Show password" (for typing it on a phone) and one error that never says which part is wrong. "Sign in with Google" stays as the second button, for Brady. An old sign-in link now just opens the sign-in page, with its code taken out of the address bar.
- **Rules:** a password sign-in counts as signed in (`sign_in_provider == 'password'`) alongside a verified email. Safe because each family email gets its account before its members entry, and the project allows one account per email ("Link accounts that use the same email", checked by Brady in the console). The outside test now checks nobody can make a new account with a family email.
- **Accounts:** made by Claude for April, Allie and Kevin with Firebase's public sign-up. None existed before, so nothing had to be deleted. Nothing was emailed to them.
- **The password and real emails never touch the repo or a file.** The family test reads them from the environment and blanks them from everything it prints; screenshots skip anything showing them.
- **Known trade-off: Allie and Kevin shouldn't use Google.** For a Gmail address, Google sign-in replaces an unverified password account, so the family password would stop working for them. Telling them at launch is simpler than hiding the Google button from them (it's one shared page). Written into FIREBASE-SETUP.
- **Test accounts get a new random password each run,** so nobody can borrow one from the public code while it's on the family list during an owner run.
- **The family test plays Brady's parts with Kevin and April** (Kevin ships a surprise for Allie to April's and gets the shipping question; April is the second Santa), because a test can't do Google sign-in. Brady's own view is the emulator run. A `TARGET=emulator-family` mode tries the family run on the emulator first.
- **Fixed in the test, not the site:** the real database sends a record's fields back in a different order each time, which the before/after comparison first counted as a change. Records are now compared with their fields sorted.

**2026-11-10: The site names the family, never "everyone".** Brady: "everyone" and "the others" sound impersonal; it's a family list. Where the page knows who's signed in, it says their names, taken from the database ("Your gifts for April, Allie and Kevin, and where they're shipping."; "April, Allie and Kevin shop from this. None of them will tell you what's been taken."). Where it can't, it says "the family" (the sign-in page, before anyone is known; "Boxes the family is shipping to your house."). Names are never written into the code, which is public. "Download everything as a spreadsheet" stays: "everything" is about the gifts, not the people.

**2026-11-10: Adding to someone's list for them.** April texted Brady a wish. Only a list's owner can add to it (even Brady can't), so Claude signed in as April with the family password and added it as an idea, in her own words, with nothing guessed (no favorites star, no "not this one" she didn't clearly say). That's the pattern for next time: signed in as them, their words only, and tell them it's there. The launch email is saved in STATUS with the password left out, since the repo is public.

**2026-11-13: UI polish pass before launch.** A look at every page, pop-up and empty state at laptop, tablet and phone widths with text at 120%, on the emulator. Brady kept all twelve fixes; each is its own commit, so any one can be undone.
- **Every button and link is at least 44px tall.** Most were 40px; Sign out and Santa's sack's page links were under 30px.
- **Rows start and end where their heading's rule does.** They were indented 10px, and Change, I'll be Santa and Add a gift each ended at a different place. Underlined buttons lost their side padding so the word itself lines up.
- **Phone fixes:** "Santa's got it" stays under an idea's name instead of dropping below its gifts; a line never ends on a lone dot; "Gimme, gimme, gimme" fits one line at 390px with larger text (DESIGN no longer promises "always"); buttons don't stay dark after a tap.
- **Pop-ups:** a text box grows with what's pasted, up to about six lines (needs iOS 26.2 on an iPhone; older ones keep two lines), and hints sit equally close under every box.
- **Small ones:** stacked add blocks line up; room under the house print; the Naughty/Nice tag is centered.
- **Not changed:** how anything is saved, read, claimed or hidden; sign-in; the rules; the sign-in page's layout.

**2026-11-13: Shopping pages say who sees what.** April texted: if she adds something she bought for Kevin that isn't on his list, can Allie and Brady see it, or just her? They can, and only Kevin can't, but the page never said so. Now it does, in four places: "Allie and Brady can." under "Kevin can't see this page"; one line under Surprises & stockings ("Gifts that aren't on Kevin's list. Allie and Brady see them too, so nobody doubles up."); one under Overheard ("Things Kevin has mentioned, to remember for later. Nobody's getting these yet."); and the gift pop-up's first line ("Allie and Brady will see this gift. Kevin won't."). Names come from the database and follow who's signed in. Overheard's box got a label you can see in place of grey hint text inside it. The two empty-state lines shrank to "Nothing yet.", since the line above them now explains.
- **Not merged into Overheard,** which Brady had floated. Overheard means nobody's getting it yet; Surprises & stockings means someone has it covered. Mixed, a bought gift and a passing remark look alike, which is how two people buy the same thing. April's question was about who can see a gift, not where to put it. If where to put it turns out to be the confusion, rename the section before merging anything.

**2026-11-13: "Are you sure?" is asked in the pop-up.** Take off my list, Not getting it and Take it off used the browser's own box, headed "bgs3jc.github.io says". The same question now takes the place of the pop-up's buttons, with "Keep it" (where the cursor lands) and "Yes, take it off" / "Yes, not getting it". Chosen over the "Undo" BACKLOG had suggested: undo would mean deleting and re-creating records, and this changes nothing about what's saved. The click-through tests click Yes; the real-site family run (`TARGET=live-family`) hasn't been repeated since.

**2026-11-13: Two smaller ones.** The globes got a thin edge on the glass in the globe's shadow color: the snowy bottom was cream on cream paper, so a globe read as a half circle floating above its base. An empty section in Santa's sack says "Nothing yet." and keeps only the heading's "Kevin's page" link; it had two links to the same page.

**2026-11-13: Testing goes to a cheaper model.** Brady asked that the token-heavy test runs go to a Sonnet sub-agent rather than the main session. The main session builds and takes a quick look; the sub-agent runs the suites, clicks through the changes at three widths and reports. It tests only and never edits, commits or signs in to the real site.
