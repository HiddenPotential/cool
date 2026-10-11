# 🥚 Pet Gacha

A small browser gacha game: hatch eggs, collect 24 pets across 5 rarities, and level them up.

## Play

**Play online:** https://hiddenpotential.github.io/cool/

Open `index.html` in a browser. The whole game is that one file, so you can download just it and double-click it. No install or build step.

You can also run a local server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## How it works

- **Tap the egg** to earn coins. Each pet you own also earns coins every second, even while you're away (up to 2 hours).
- **Hatch ×1** costs 100 coins. **Hatch ×10** costs 900 and always includes at least one Rare or better.
- **Pity:** if you go 50 hatches without a Legendary or Mythic, the next one is a Legendary.
- **Duplicates** level a pet up (max Lv 10). Higher levels earn more. Duplicates after max level give coins back.
- **Daily gift:** 500 free coins once a day.
- **Hatch animation:** a shooting star crashes in and drops the egg. Energy spirals into it while its glow climbs through the rarity colors, hinting at your best pet, then it cracks and bursts in a shower of sparks and shockwaves. Legendary pulls add lightning, a screen quake, confetti and fireworks. Mythic pulls disguise themselves as Legendary, then glitch and turn rainbow. Results are dealt face-down and flip one by one, rarest last, with sparks on rare cards. Tap at any time to skip.
- **Sound:** short synth sound effects, toggled with the 🔊 button.
- Progress saves in your browser's `localStorage`.

| Rarity    | Chance | Income / pet |
|-----------|--------|--------------|
| Common    | 60%    | 0.2/s        |
| Rare      | 26%    | 1/s          |
| Epic      | 10%    | 4/s          |
| Legendary | 3.5%   | 15/s         |
| Mythic    | 0.5%   | 60/s         |

## Files

Everything is in `index.html`: the styles in the `<style>` tag, the particle effects (sparks, shockwaves, lightning, fireworks, confetti) in the first `<script>`, and the game logic in the second. To add pets or change the odds, edit the `PETS` and `RARITIES` lists at the top of the game script.
