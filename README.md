# 🥚 Pet Gacha

A small browser gacha game: hatch eggs, collect 24 pets across 5 rarities, and level them up.

## Play

Open `index.html` in a browser. No install or build step.

You can also run a local server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

To host it for free, turn on **GitHub Pages** (Settings → Pages → Deploy from branch → `main` / root).

## How it works

- **Tap the egg** to earn coins. Each pet you own also earns coins every second, even while you're away (up to 2 hours).
- **Hatch ×1** costs 100 coins. **Hatch ×10** costs 900 and always includes at least one Rare or better.
- **Pity:** if you go 50 hatches without a Legendary or Mythic, the next one is a Legendary.
- **Duplicates** level a pet up (max Lv 10). Higher levels earn more. Duplicates after max level give coins back.
- **Daily gift:** 500 free coins once a day.
- Progress saves in your browser's `localStorage`.

| Rarity    | Chance | Income / pet |
|-----------|--------|--------------|
| Common    | 60%    | 0.2/s        |
| Rare      | 26%    | 1/s          |
| Epic      | 10%    | 4/s          |
| Legendary | 3.5%   | 15/s         |
| Mythic    | 0.5%   | 60/s         |

## Files

- `index.html`: page layout
- `style.css`: styles and animations
- `game.js`: game logic (pets, drop rates, saving). To add pets or change the odds, edit the `PETS` and `RARITIES` lists at the top.
