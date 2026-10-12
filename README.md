# 🪙 Coin Pusher

An arcade coin pusher for the browser. Drop coins onto a sliding shelf, let the pusher shove them toward the edge, and collect everything that falls off the front.

## Play

**Play online:** https://hiddenpotential.github.io/cool/

Or download `index.html` and double-click it. The whole game is that one file, with no install or build step.

## How it works

- **Drop coins:** tap the playfield to drop a coin at that spot, or press **DROP** (or Space) to drop from the moving chute. Hold to keep dropping. Each drop costs 1 credit, and there is a short cooldown (0.35s) between drops, shown as a sweep on the DROP button.
- **The pusher:** the shelf slides back and forth. The back wall scrapes coins off the shelf onto the table, and the shelf's front face pushes the table coins forward.
- **Winning:** the front of the table is a ramp that slopes up to the edge, so loose coins slide back toward the pusher, and a raised lip at the very edge kicks them back again. Coins pushed over the **front edge** pay out. Near the front, the sides are open, and coins that fall off there go to the house.
- **Lucky slot:** coins roll down inside the back wall and slide out of a slot onto the shelf. If one rolls past the moving **LUCKY** window on the way down, you earn a spin.

| Reels | Prize |
|-------|-------|
| 7 7 7 | Jackpot: 25-coin shower and a 💎 gem |
| 💎 💎 💎 | A 10-credit big coin and 8 coins |
| ⭐ ⭐ ⭐ | A ★ bonus token |
| 🍒 🍒 🍒 | 6 coins |
| 🔔 🔔 🔔 | 4 coins |
| 🪙 🪙 🪙 | 2 coins |

- **Special pieces:** push a big coin off for 10 credits, a ★ token for 3 free spins, or a 💎 gem for 50 credits.
- **Coin Machine:** next to the pusher is a coin machine that gives you free coins once a day (it resets at midnight). Day 1 pays 50 coins, and each consecutive day adds 10 more, up to 110 on day 7. Miss a day and the streak starts over.
- **Free credits:** you start with 30. While you have fewer than 5, you also get 1 free credit every 15 seconds.
- **Saving:** your credits, winnings and every coin on the table save in your browser.

Without the slot bonuses, the table returns about 83% of the coins you drop. The bonuses bring it close to even.

## Code

Everything is in `index.html`. The physics is the `Machine` class between the `SIM-START` and `SIM-END` markers, which has no browser dependencies. To change how generous the machine is, adjust `SIDE_WALL_END` (longer side walls lose fewer coins) or the slot `OUTCOMES` weights.
