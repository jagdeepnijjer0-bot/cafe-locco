You are redesigning and restructuring the premium restaurant membership flow inside our mobile app.

The app already has an ultra-premium dark hospitality aesthetic.
Your job is to improve the UX architecture, remove duplication, improve consistency, and maintain the same elegant luxury design language throughout every screen.

IMPORTANT:
Do NOT redesign the app into a generic SaaS/dashboard style.
Maintain the same premium restaurant/lounge/hospitality feel already established.

==================================================
MAIN GOAL
=========

We currently have:

1. A “Membership / Subscription” information page
2. A “My Membership” member dashboard page

Right now they feel too similar and slightly duplicated.

Your task is to restructure them correctly into:

* PUBLIC membership onboarding flow
* PRIVATE logged-in membership dashboard flow

==================================================
NEW STRUCTURE REQUIRED
======================

==================================================

1. PUBLIC MEMBERSHIP PAGE
   ==================================================

This page is for:

* non-members
* visitors
* users not logged in

Purpose:
Sell the premium membership.

This page should include:

* premium membership introduction
* pricing (£19.99/month)
* benefits/perks
* luxury coffee imagery
* CTA buttons
* login option for existing members

Buttons:

1. “Sign Up & Subscribe”
2. “Already a Member? Log In”

This page should feel:

* elegant
* cinematic
* premium
* minimal
* luxurious
* atmospheric

Do NOT overload with too much information.

==================================================
2. CREATE ACCOUNT SCREEN
========================

When user clicks:
“Sign Up & Subscribe”

Open a dedicated signup screen.

Keep it extremely clean and minimal.

Fields:

* Full name
* Email
* Password
* Confirm password

Button:
“Continue to Membership”

Maintain the same dark premium theme.

==================================================
3. STRIPE SUBSCRIPTION FLOW
===========================

After signup:

* continue to Stripe checkout
* activate subscription
* save membership status
* create account session

After successful payment:
redirect user to:
“My Membership”

==================================================
4. LOGIN SCREEN
===============

When user clicks:
“Already a Member? Log In”

Open dedicated login screen.

Fields:

* Email
* Password

Button:
“Log In”

Maintain same premium theme and spacing.

==================================================
5. PRIVATE MEMBER DASHBOARD
===========================

Rename and structure this as:
“My Membership”

This page is ONLY for logged-in members.

Purpose:
Manage and use membership.

This page should contain:

* coffee claim section
* VIP access granted
* next billing date
* active membership status
* manage subscription
* update payment method
* cancel membership
* premium member since date

This page should feel:

* exclusive
* private
* elegant
* premium
* refined

==================================================
6. MENU / NAVIGATION STRUCTURE
==============================

IF USER IS NOT LOGGED IN:
Menu item should say:
“Membership”

IF USER IS LOGGED IN:
Menu item should automatically change to:
“My Membership”

This removes duplication and improves UX clarity.

==================================================
7. DESIGN CONSISTENCY
=====================

Across ALL screens:

* maintain same typography
* maintain same spacing system
* maintain same button styling
* maintain same icon styling
* maintain same border radius
* maintain same colour palette
* maintain same dark luxury atmosphere

IMPORTANT:
The “Manage Subscription” screen currently feels too dashboard/SaaS-like.

Redesign it to feel:

* softer
* more premium
* more hospitality focused
* more elegant
* less harsh grey card UI

==================================================
8. BORDER + CARD IMPROVEMENTS
=============================

Current white borders are slightly too harsh.

Please:

* reduce border opacity slightly
* soften the outlines
* make borders more refined
* reduce visual harshness

Goal:
More luxury.
Less aggressive contrast.

==================================================
9. MENU SCREEN IMPROVEMENTS
===========================

Improve:

* vertical spacing
* menu readability
* typography hierarchy
* price alignment
* breathing room

Maintain same overall layout and aesthetic.

==================================================
10. BUTTON FUNCTIONALITY
========================

Currently buttons are prototype-only.

Convert all key buttons into real navigation/actions:

PUBLIC FLOW:

* Sign Up & Subscribe
  → opens signup screen

* Already a Member? Log In
  → opens login screen

PRIVATE FLOW:

* Manage Subscription
  → opens subscription management screen

* Update Payment Method
  → opens payment update flow

* Cancel Subscription
  → opens cancellation confirmation flow

==================================================
11. OVERALL DESIGN DIRECTION
============================

The app should feel inspired by:

* premium coffee lounges
* luxury hospitality brands
* Soho House
* modern boutique cafés
* high-end minimalist restaurant apps

The app should feel:

* calm
* premium
* intentional
* cinematic
* refined
* expensive
* minimal

Avoid:

* generic dashboard UI
* overly bright elements
* excessive gradients
* clutter
* cheap SaaS aesthetics

==================================================
12. IMPORTANT
=============

Do NOT completely redesign the app.

Refine and unify the existing design system.

Keep:

* same overall direction
* same atmosphere
* same premium dark identity

Focus on:

* consistency
* UX structure
* premium refinement
* navigation clarity
* member flow clarity
* elegant spacing
* cohesive styling
