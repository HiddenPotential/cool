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
- **Theme Shop:** spend credits, or trade in prizes from your shelf (common 1 point, rare 3, super rare 8; your least valuable go first), to unlock new looks for the whole arcade. **Under the Sea** (400 credits or 12 points) brings sand, kelp, bubbles and a claw machine full of sea creatures; **Candy Land** (500 credits or 15 points) brings candy-cane stripes, a frosting floor, lollipop trees and sweets with faces; **Outer Space** (600 credits or 18 points) brings a starfield, moon rock and rockets, aliens and robots; **Spooky Night** (700 credits or 21 points) brings stone walls, a graveyard, flickering jack-o'-lanterns, fog and cute monsters. Then there are the holidays: **Thanksgiving** (600 credits or 18 points) brings plaid walls, fallen leaves, hay bales and corn, and turkeys, pies, acorns and a pilgrim bear; **Christmas** (800 credits or 24 points) brings falling snow, twinkling trees, presents and string lights, and reindeer, snowmen, penguins, gingerbread men and Santa; **Valentine's Day** (500 credits or 15 points) brings heart balloons, roses and rising hearts, and love bears, love letters, Cupid and a diamond ring; **Easter** (500 credits or 15 points) brings tulips, painted eggs and drifting petals, and bunnies in bonnets, chicks, lambs, ladybugs and a jewelled egg. **St. Patrick's Day** (500 credits or 15 points) brings shamrock walls, a clover meadow, a rainbow and pots of gold, and leprechauns, lucky horseshoes, gold coins and a golden harp; **Fourth of July** (600 credits or 18 points) brings stars and stripes, a picnic-blanket floor, flags, bunting, star balloons and fireworks, and bald eagles, hot dogs, firecrackers and a liberty torch. Each theme has its own set of 13 prizes, and you can switch between themes you own any time you're not mid-game.
- **Coin Machine:** next to the pusher is a coin machine that gives you one free payout of 50 coins each time you open the arcade.
- **Free credits:** you start with 30. While you have fewer than 5, you also get 1 free credit every 15 seconds.
- **Fresh start:** every time you open the arcade, everything starts over: credits, coins on the table, both machines, your prize shelf and themes. Only the sound setting is remembered.

Without the slot bonuses, the table returns about 88% of the coins you drop once the pile has settled. The bonuses bring it close to even.

## Code

Everything is in `index.html`, as one module script. [three.js](https://threejs.org) draws the machines and [Rapier](https://rapier.rs) runs their physics, each machine in its own physics world. To change how generous the pusher is, adjust `SIDE_WALL_END` (longer side walls lose fewer coins), `SLOPE_H`/`LIP_H` (a taller ramp holds more coins back) or the slot `OUTCOMES` weights. The claw's odds are `CLAW_GRIP`, `CLAW_PITY` and each prize's `weight`.
