# Silent-Study-Tile

**Phone-free Pomodoro timer** on a micro:bit that only counts study time when it’s quiet.  
A = Start/Power (+ 5s multi-tap to choose # of blocks) · B = Pause/Resume · Noise ≥ threshold shows **X** and beeps 1 Hz while time is paused.

## Demo
- **Video (~100s):** https://youtu.be/DwXlfS96k24?si=4ErYAXZaSrnEDjqe
- **MakeCode project:** https://makecode.microbit.org/S38022-16616-31324-20743
- **Download firmware:** [`firmware/microbit-Silent-Study-Tile.hex`](firmware/microbit-Silent-Study-Tile.hex)

## Poster
[View the full poster (PDF)](docs/The%20Silent%20Study%20Tile.pdf)

## Prototype Views
<p align="center">
  <img src="docs/renders/front.png" width="45%" alt="Front view">
  <img src="docs/renders/side.png" width="45%" alt="Side view">
  <img src="docs/renders/back.png"  width="45%" alt="Back view">
</p>

## How it works
- Each block: **intro → 1s gap → countdown**. LED grid drains one LED per tick (demo: 0.5 s; real: 1 min).
- **Noise-Lock:** if `soundLevel ≥ threshold` (default **100**), show **X**, **beep 1 Hz**, and **pause time**.
- **Pause/Resume:** Button **B**.
- End of block: **outro → 1s → ✔**; short break; last block → **auto power-off**.

## Configure
- In `code/main.ts`:
  - `noiseThresh` (default 100; adjust per room)
  - `TICK_MS` (demo **500**, real **60000**)
  - `BREAK_MS` (demo **2500**, real **300000**)
  - `TAP_WINDOW_MS` (**5000** ms, choose # blocks)
  - `MAX_BLOCKS` (cap)

## Build/flash
- Open the MakeCode link → **Download** to get `.hex` → drag onto the **MICROBIT** drive.
- Or edit `code/main.ts` in MakeCode (JavaScript view), then **Download**.

## Files
- `code/main.ts` – source (TypeScript, MakeCode)
- `firmware/*.hex` – compiled artifact for quick flashing
- `docs/The Silent Study Tile.pdf` – assignment poster
- `docs/flowchart.png`, `docs/renders/` – visuals (optional)

## License
MIT © James Mascarenhas
