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
