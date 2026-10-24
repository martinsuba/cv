# Martin inputs log
One line per input Martin had to give. Used for retrospectives (what can be automated?).

date | gate/phase | what Martin did | could an agent do it? (y/n + why)
--- | --- | --- | ---
2026-10-23 | plan | pointed the Lead to the career notes (context was outside the repo) | y – a CLAUDE.md/STATUS pointer to the notes would have let the Lead find them
2026-10-23 | plan | decided JSON is the source of truth, rebuilt from it | n – product decision
2026-10-23 | plan | chose Pages project site at /cv/ over root (asked why /cv/) | n – URL choice; Lead should have explained Pages URL rules up front
2026-10-23 | plan | chose Vite migration; content from his PDF | n – Martin's decision
2026-10-23 | plan | asked for manual-trigger deploy; delegated icons, PR cleanup and further decisions to the Lead | n – preference
2026-10-23 | plan gate | merged plan PR #40 and said "go" | n – approval gate
2026-10-23 | harness gate | added `acceptance-change` label and merged harness PR #41 | n – framework gate (label must be Martin's)
2026-10-23 | M1 gate | said "go m1" | n – milestone gate
2026-10-23 | M1 | asked to decide on seeded-bug check after auto mode blocked a neutral PR description | y – a pre-approved permission rule or a blind setup (reviewer told nothing, body neutral from the start) would avoid it
2026-10-23 | M1 | chose option 1 (allow neutral seeded PR description) | n – permission decision after auto-mode block
2026-10-23 | M1 gate | merged milestone PR #49, said "go M2" | n – milestone gate
2026-10-23 | M2 gate | merged milestone PR #51, approved first production deploy ("deploy") | n – deploy gate
2026-10-23 | deploy | extended the agent's GitHub PAT with Pages permission after a 403 on enabling Pages | y – could be granted up front in the repo-setup checklist (harness), so deploy needs no extra round
2026-10-23 | after deploy | asked for root redirect, better PDF (font, paddings) and design alternatives | n – product/design feedback
2026-10-23 | plan v2 gate | merged plan v2 #53, deploy record #52, root redirect PR; said "go M3" | n – gates
2026-10-23 | M3 T-008 | approved a 4th fix round after the 3-round limit ("ok go on") | y – the round limit could allow +1 for test-only one-liners; root cause was a missing spike on variable-font PDF embedding
2026-10-23 | T-010 | picked design direction A (Technical ledger) | n – design choice
2026-10-23 | deploy gate | approved deploy of T-008/T-009 ("deploy") | n – deploy gate
2026-10-23 | T-014 | told the Lead to take the photo from the chat ("you copy it") | y – the Lead could have saved the pasted image from the session transcript right away instead of asking for scp
2026-10-23 | M4 gate | merged plan v3 + M3 milestone #56, said "go M4" | n – milestone gate
2026-10-23 | M4 review | asked whether the red Vitest runs in the mutation summary are OK; asked to fix the Node 20 action deprecation in the next milestone | y – the milestone PR could explain the mutation summary up front; the deprecation was already planned as T-012
2026-10-23 | M4 gate + deploy gate | merged M4 milestone #61, approved deploy, said "go M5" | n – gates
2026-10-23 | M5 T-012 | added acceptance-change label and merged #63 (acceptance-guard.yml changed) | n – framework gate
2026-10-23 | M5 | paused the session for the Claude usage limit, asked for a status write-up | n – resource limit
2026-10-24 | resume | merged status PR #65, said "you continue" | n – gate
2026-10-24 | M5 gate | merged M5 milestone #66; approved deploy, retro and plan v4 improvements | n – gates
2026-10-24 | M6 gate | merged retro #67 and plan v4 #68, said "go M6" | n – gates
2026-10-24 | M6 T-021 | needs to dismiss stale Dependabot alerts (PAT cannot read them) | y – resolved: Martin granted "Dependabot alerts: read"; all 218 alerts were already fixed, none to dismiss
