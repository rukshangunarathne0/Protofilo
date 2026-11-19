# Happy Time Connect — Notes in Simple Language

> This is the same information as `PROJECT-NOTES.md`, but written in normal, easy words. If a technical word appears, it is explained right there. Read this if you want to understand the app without a computer background.

---

## 1. What is this app?

It is the **Happy Time wholesale web app**. The website name is **Happy Time Connect**.

Before, orders came by phone call or WhatsApp and were written in a book or a chat. Now everything is in one website.

Two kinds of people use it:

- **Wholesale dealers** (your customers) — they log in, look at the products, and place orders.
- **Your online staff** — they log in and use a control screen to manage stock, orders and dealer accounts.

Both see the same information at the same time. That is the whole point: one place, no confusion.

| Thing | Detail |
|---|---|
| Website | https://happy-time-connect.vercel.app |
| Where the code is kept | GitHub, repository `shxnzyy/ht-ws-project`, branch `happytime-ws` |
| Where the website is hosted | Vercel (the company that puts the site on the internet) |
| Where the data is kept | Supabase (an online database — think of it as a very safe Excel file that the website can read and write) |
| Phone number shown in the app | 077 352 8760 |

---

## 2. What is inside the app

### The sign-in page
The first screen. Shows the Happy Time Connect logo, asks for email and password, and has a contact link (call, WhatsApp or send feedback).

### Dealer side
- See the product list with prices and how many are available.
- Place an order.
- Follow the order — Packing, Ready, Completed.
- Ask for an item that is finished ("pre-order") and see when it is expected.

### Staff side (admin console)
- Add, change or remove products and stock.
- See every order and move it forward.
- Approve new dealers, or put one on hold.
- Track pre-orders.
- Read the feedback customers send.

---

## 3. What is the app built with?

You do not need to know these names, but for reference:

- **Vite** — the tool that builds the website. It turns the code into the fast page users see.
- **Supabase** — the database, the logins and the photo storage. The website talks to Supabase directly. There is no middle computer in between.
- **Vercel** — puts the website online and gives it the address.
- **GitHub** — the place where files are stored with history, so nothing is ever truly lost.

### 🚨 One important idea
Because the website talks to the database **straight from the browser**, the database itself must decide who is allowed to see what. That guard is called **RLS** (Row Level Security). Think of it as a doorman inside the database. If the doorman is asleep, anyone can walk in.

**Right now the doorman is asleep.** That is the biggest problem in the app. Details are in `APP-ISSUES.md`.

---

## 4. What does the data look like?

There are 7 "tables". A table is just a sheet with rows, like an Excel tab.

| Sheet (table) | What is in it | Rows now |
|---|---|---|
| Products | All the watches and clocks: name, category, price, how many in stock, how many already promised, photo | 6 |
| Orders | Every order: which dealer, date, amount, items, status | 8 |
| Pre-orders | Items a dealer asked for that are not in stock yet | 3 |
| Dealers | Your wholesale customers: name, email, city, status, payment terms | 7 |
| Staff profile | Your staff member's name, role, warehouse | 1 |
| Feedback | Messages and star ratings from customers | 4 |
| Profiles | Meant for real login accounts — **empty and not used yet** | 0 |

### What the numbers mean
- **Stock** = how many you actually have.
- **Reserved** = how many you already promised to open orders.
- **Available** = stock minus reserved. This is the number a dealer should see.

⚠️ On 3 products, "reserved" is bigger than "stock", so "available" is a **negative number**. That means the app thinks you owe more than you own. It is a bug, not a real shortage of stock.

---

## 5. How a normal order works

1. A dealer logs in.
2. They look at the products and the available quantity.
3. They pick items and confirm the order.
4. The order is saved in the Orders sheet, and the quantity is added to "reserved" so nobody else takes the same pieces.
5. Your staff see the order and mark it Packing → Ready → Completed.
6. **When it is completed, the reserved quantity should be freed.**
   Right now that last step does not happen properly — that is why the numbers are negative.

---

## 6. How the website is put online

Today: someone runs a command on a computer and the site goes up. Simple, but nobody can see which version is live.

**The better way (still to be done):** connect GitHub to Vercel once. After that, every time we save a change to GitHub, the website updates by itself. If a change is bad, we can go back one step. This is item 24 in the issue list.

There is also **no test site**. Everything is tested on the real site, with real data. A small test copy would be safer.

---

## 7. Simple rules for anyone working on the app

1. Every new sheet (table) must have a doorman (RLS) from day one.
2. Dealers and staff must be real logins, not just names typed into a sheet.
3. The computer adds up the money — never type a total by hand.
4. Dates must be real dates, not text that looks like a date.
5. Statuses must be chosen from a fixed list, not typed freely.
6. Use a fixed ID number for dealers and products, not the name.
7. Passwords and secret keys never go into GitHub.
8. Test with fake data, never with a real dealer's order.

---

## 8. What still needs doing

The full list is in `APP-ISSUES.md`, with numbers and how to fix each one. The short version, in order of importance:

1. **Lock the database** — right now anyone can read or delete your orders.
2. **Remove the demo "Admin view" button** from the public login page.
3. **Create real logins** for dealers and staff.
4. **Fix the stock numbers** (reserved is bigger than stock on 3 products).
5. **Fix the order totals** — the amount does not match the items on all 8 orders.
6. **Fix email** — password reset and confirmation links point to `localhost` and will not work for real users.
7. **Connect GitHub to Vercel** so updates are automatic and backed up.
8. Small things later: real product photos, allow staff to upload photos, fix one order that belongs to an unknown dealer.

---

## 9. If something looks broken, check this

| What you see | Likely reason |
|---|---|
| Page opens but everything is empty | The website lost its connection settings to the database |
| A dealer sees nothing | The doorman (RLS) is blocking too much, or they are not logged in |
| "Permission denied" when saving | No permission rule written for that action yet |
| Stock numbers look wrong | Reserved quantity not freed after completing an order |
| Cannot upload a photo | Photo storage has no upload permission yet |
| Password reset email never arrives | Settings still point to `localhost`, and no email sender is set up |
| The live site shows old content | It is not connected to GitHub, so it needs a manual update |

---

## 10. Other notes in this folder

| File | What it is |
|---|---|
| `README.md` | The front page of the folder |
| `SUMMARY.md` | One short page about the project |
| `PROJECT-NOTES.md` | The professional version of this document |
| `PROJECT-NOTES-SIMPLE.md` | This file — easy language |
| `APP-ISSUES.md` | Every problem found, with a fix for each |
