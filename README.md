# 🪙 Coin Pusher

An arcade coin pusher for the browser. Drop coins onto a sliding shelf, let the pusher shove them toward the edge, and collect everything that falls off the front. Then spend your credits on the 🧸 claw machine.

## Play

**Play online:** https://hiddenpotential.github.io/cool/

Or download `index.html` and double-click it. The whole game is that one file, with no install or build step.

## How it works

- **Drop coins:** tap the playfield to drop a coin at that spot, or press **DROP** (or Space) to drop from the moving chute. Hold to keep dropping. Each drop costs 1 credit, and there is a short cooldown (0.35s) between drops, shown as a sweep on the DROP button.
- **The pusher:** the shelf slides back and forth. The back wall scrapes coins off the shelf onto the table, and the shelf's front face pushes the table coins forward.
- **Winning:** coins pushed off the **front edge** pay out. Near the front, the sides are open, and coins that fall off there go to the house.
- **Real coin physics:** coins pile on top of each other, slide with friction, and only tip over an edge when the balance point of the coin plus everything stacked on it is past the edge. Coins can hang over the lip held down by the coins behind them, and when one drops, the coins resting on it tumble too.
- **Lucky slot:** drop a coin through the moving **LUCKY** gate on the back wall to earn a spin. The gate is checked when your coin falls past it, a moment after you drop, so aim where the gate is going.

| Reels | Prize |
|-------|-------|
| 7 7 7 | Jackpot: 25-coin shower and a 💎 gem |
| 💎 💎 💎 | A 10-credit big coin and 8 coins |
| ⭐ ⭐ ⭐ | A ★ bonus token |
| 🍒 🍒 🍒 | 6 coins |
| 🔔 🔔 🔔 | 4 coins |
| 🪙 🪙 🪙 | 2 coins |

- **Special pieces:** push a big coin off for 10 credits, a ★ token for 3 free spins, or a 💎 gem for 50 credits.
- **Free credits:** you start with 20. While you have fewer than 3, you get 1 free credit every 30 seconds.
- **Saving:** your credits, winnings and every coin on the table save in your browser.

Without the slot bonuses, the table returns about 75% of the coins you drop, and the bonuses bring it to roughly 85%, so you slowly lose unless you hit the LUCKY gate often. The gate is narrow and fast, so timing your drops is the skill. A new game starts from a machine recorded after 10 minutes of simulated play, so coins are already piled up and sitting on the brink.

## Claw machine

Switch machines with the tabs at the top. Both machines share the same credits.

- **Playing:** each play costs 5 credits. You get 15 seconds to steer the claw with ◀ ▶, by dragging on the machine, or with the arrow keys. Press **GRAB** (or Space) to drop it.
- **The grab:** the claw sinks onto the prize under it, closes, lifts, and carries it to the chute on the left. The grip is weak, like a real arcade claw, so a prize can slip on the way. Grabbing near a prize's middle helps, and rare prizes are heavier and harder to hold.
- **Guarantee:** after 6 misses in a row, the next grab is guaranteed strong.
- **Prizes:** 8 common plushies, 3 rare ones (🦄 🐲 🐙) and 2 super-rare ones (👑 🏆). The machine restocks when it runs low.
- **Prize shelf:** prizes you win show up on the shelf with counts. Ones you haven't won show as silhouettes. The shelf saves in your browser.

In testing, about 1 play in 3 or 4 wins a prize.

## Code

Everything is in `index.html`. The physics is the `Machine` class between the `SIM-START` and `SIM-END` markers, which has no browser dependencies. To change how generous the machine is, adjust `SIDE_WALL_END` (longer side walls lose fewer coins) or the slot `OUTCOMES` weights. `GRIP`, `JAM` and `MAX_STACK` control how readily coins pile up. All the textures (playfield print, diamond-plate shelf, back wall, coins) are drawn by code when the page loads.
