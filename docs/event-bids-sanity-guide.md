# Event Bids Page — Sanity Editing Guide

**Page URL:** [quadballcanada.ca/events/bids/](https://www.quadballcanada.ca/events/bids/) (EN) | [/fr/evenements/appels-doffres/](https://www.quadballcanada.ca/fr/evenements/appels-doffres/) (FR)

---

## How to find it in Sanity Studio

1. Open the Studio at [quadball-canada.sanity.studio](https://quadball-canada.sanity.studio)
2. In the left sidebar, find **Event Bids Page** (there is only one — it's a singleton)
3. Click it to open the editor

---

## What you can edit

### 1. Selected Hosts — Domestic

This is the table of awarded Canadian events. Each row has:

| Field | What to enter | Example |
|---|---|---|
| **Event Name** (EN + FR) | Name of the championship | `2026 Eastern Regionals` / `Régionaux de l'Est 2026` |
| **Host City** | City and province | `Waterloo, ON` |
| **Date Label** (EN + FR) | Human-readable date | `November 7-8` / `7-8 novembre` |
| **Event URL** | Optional link to the event detail page | `/events/eastern-regionals-2026/` |

Click **Add item** to add a new row. Drag rows to reorder them.

### 2. Selected Hosts — International

Same fields as domestic, plus an optional **Description** field for extra context (e.g. "Canada will send teams to compete").

### 3. Current Bid Cycle

This controls the bordered card shown on the page. Fill it in when a new bid cycle opens.

| Field | What it does |
|---|---|
| **Status** | Pick one: **Open** (green badge), **Closed** (red badge), or **Coming Soon** (yellow badge) |
| **Status Message** (EN + FR) | Short sentence shown below the badge, e.g. "Bids are now open for the 2028-29 season" |
| **Bid Manual (PDF)** | Upload the bid manual PDF — a download button appears automatically |
| **Bid Manual Link Title** (EN + FR) | Button label for the PDF download, e.g. "Download Bid Manual" |
| **Submission URL** | Link to the bid submission form (Google Form, etc.) — a "Submit a Bid" button appears when status is Open |
| **Submission Deadline** | Date picker — shown formatted on the page |

**When no bid cycle is active:** Set status to "Closed" and leave the other fields empty. The page will show "No active bid cycle at this time."

### 4. SEO (optional)

Meta title, meta description, and Open Graph image for social sharing. If left blank, defaults are used.

---

## Data to enter for the 2026-2028 cycle

From the hosting announcement article, add these **Domestic Hosts**:

| Event Name (EN) | Host City | Date Label (EN) |
|---|---|---|
| 2026 Eastern Regionals | Waterloo, ON | November 7-8 |
| 2026 Western Regionals | Surrey, BC | November 7 |
| 2027 National Championships | Edmonton, AB | March 20-21 |
| 2027 Eastern Regionals | Saint John, NB | November 6-7 |
| 2027 Western Regionals | Surrey, BC | November 6-7 |
| 2028 National Championships | Ottawa, ON | March TBD |

And this **International Host**:

| Event Name (EN) | Host City | Date Label (EN) | Description (EN) |
|---|---|---|---|
| 2028 Quadball PANAMS | Edmonton, AB | TBD | Awarded to Canada by the IQA |

Set the **Current Bid Cycle** status to **Closed** (the 2026-2028 cycle has already been awarded).

---

## After editing

1. Click **Publish** in the top-right corner of the Studio
2. The website rebuilds automatically within a few minutes
3. Check the live page to confirm your changes appear
