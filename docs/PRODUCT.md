# Product

## The problem

Every year Brady keeps a detailed spreadsheet wish list (links, prices, specs, notes). Allie sends a loose Word doc of links. April barely makes a list, so ideas have to be pried out of her. Brady then builds separate tracking spreadsheets so the two non-recipients can coordinate: one for April's gifts (Brady + Allie), one for Allie's (Brady + April). The family plays Santa, so the Christmas-morning surprise matters, and many of the best gifts aren't on anyone's list.

## People

Brady, April, Allie, Kevin. The people list is data, not code, so adding someone is easy.

## Core concepts

- **Wish list item:** written by the owner about themselves. Fields: title, link, price, specs/notes, priority. Detail is optional, so Brady can be thorough and Allie can just paste a link.
- **Gift:** anything someone plans or buys for someone else. It may be claimed from a wish list item, or be off-list (surprise, stocking stuffer, Santa gift). Fields: recipient, giver, price, status (idea → bought → wrapped), notes, optional link to a wish list item.
- **Idea log:** anyone can note gift ideas about someone else at any time of year (things they mentioned, liked, need). Applies to everyone, not just April. Ideas can be promoted to gifts.

## Visibility rules (the heart of the product)

- You see your own wish list exactly as you wrote it, with no claim markers.
- You never see gifts, claims or ideas where you are the recipient.
- Everyone else sees everything about a recipient: their wish list with claim status, all gifts, all ideas.
- Enforced by Firestore security rules, not just hidden in the UI.

## v1 scope

1. Sign in (Google, plus email link for April).
2. My wish list: add, edit, reorder and remove items.
3. Shopping for [person]: their wish list with claim status, plus off-list gifts and ideas, hidden from them.
4. Claim an item / add an off-list gift, with giver, price and status.
5. Idea log per person.
6. A festive, distinctive design (direction chosen from mockups).

Everything else goes in `BACKLOG.md` until v1 works end to end.
