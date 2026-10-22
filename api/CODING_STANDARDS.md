# Coding standards

Judgement for the Focuship API. Commands, architecture and the passwordless / guard /
cache / throttle facts live in `CLAUDE.md`.

## Library owns the check

`App\Account\Library` is the one place a preset cap, a label length, a mix, or a timer
bound is decided. The site's controllers and the MCP's tools both call it, so the two
surfaces cannot drift.

A controller or tool checks **shape**: required keys, JSON types, a UUID. Whether the
value is *usable* is Library's. `UpdateSettings` is the model — it forwards `focus` and
`volume` as sent, and `saveSettings` is what refuses them.

## Pass input uncast

Hand Library what arrived. It refuses a volume of `"loud"` and 25.5 minutes; a `(int)`
or `(float)` cast would quietly save silence or 25. Shape validation (`required`,
`array`, `numeric`) is fine. Bounds, catalogues and last-write-wins clocks stay in
Library.

## Errors say what to do instead

Tool text and 422 bodies are read by people and by models. Say what went wrong, what to
do instead, and name the tool that helps (`Use search-sounds to find the right ids.`,
`Call list-my-presets to see what is saved.`).
