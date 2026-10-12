# 🪙 Coin Pusher

An arcade for the browser, in real 3D: a coin pusher, a claw machine and a free daily coin machine. Drop coins onto a sliding shelf, let the pusher shove them toward the edge, and collect everything that falls off the front, then spend your winnings on the claw.

## Play

**Play online:** https://hiddenpotential.github.io/cool/

Or download `index.html` and the `audio` folder and open `index.html`. There's no install or build step. (The game still works without the `audio` folder, just without the claw machine music.) It loads three.js and the Rapier physics engine from a CDN, so it needs an internet connection.

## How it works

- **Drop coins:** the chute slides back and forth on its own. Tap the playfield, press **DROP** or press Space to drop a coin from wherever it is, so time your drops. Hold to keep dropping. Each drop costs 1 credit, and there is a short cooldown (0.35s) between drops, shown as a sweep on the DROP button.
- **The pusher:** the shelf slides back and forth. The back wall scrapes coins off the shelf onto the table, and the shelf's front face pushes the table coins forward. Every coin is a real physics object, so they stack, stand on edge and topple.
- **Winning:** the front of the table is a ramp that slopes up to the edge, so loose coins slide back toward the pusher, and a raised lip at the very edge kicks them back again. Coins pushed over the **front edge** pay out. Near the front, the sides are open, and coins that fall off there go to the house.
- **Lucky slot:** coins fall down a glass tube on the back wall and tumble out onto the shelf. If one falls past the moving **LUCKY** window on the way down, you earn a spin.

| Reels | Prize |
|-------|-------|
| 7 7 7 | Jackpot: 25-coin shower and a 💎 gem |
| 💎 💎 💎 | A 10-credit big coin and 8 coins |
| ⭐ ⭐ ⭐ | A ★ bonus token |
| 🍒 🍒 🍒 | 6 coins |
| 🔔 🔔 🔔 | 4 coins |
| 🪙 🪙 🪙 | 2 coins |

- **Special pieces:** push a big coin off for 10 credits, a ★ token for 3 free spins, or a 💎 gem for 50 credits.
- **Claw Machine:** 5 credits a play, with its own music ("Retro Game Arcade" by moodmode) while you play. Steer the claw left, right, back and forward (the pad, the arrow keys, or drag on the machine) and grab before the 20 seconds run out; its shadow and aiming laser show where it will land. The claw is weak like a real one: grab prizes near the middle, and miss 6 times in a row for a guaranteed strong grab. Prizes you drop through the hole go on your prize shelf.
- **Coin Machine:** next to the pusher is a coin machine that gives you free coins once a day (it resets at midnight). Day 1 pays 50 coins, and each consecutive day adds 10 more, up to 110 on day 7. Miss a day and the streak starts over.
- **Free credits:** you start with 30. While you have fewer than 5, you also get 1 free credit every 15 seconds.
- **Saving:** your credits, winnings and every coin on the table save in your browser.

Without the slot bonuses, the table returns about 88% of the coins you drop once the pile has settled. The bonuses bring it close to even.

## Code

Everything is in `index.html`, as one module script. [three.js](https://threejs.org) draws the machines and [Rapier](https://rapier.rs) runs their physics, each machine in its own physics world. To change how generous the pusher is, adjust `SIDE_WALL_END` (longer side walls lose fewer coins), `SLOPE_H`/`LIP_H` (a taller ramp holds more coins back) or the slot `OUTCOMES` weights. The claw's odds are `CLAW_GRIP`, `CLAW_PITY` and each prize's `weight`.
