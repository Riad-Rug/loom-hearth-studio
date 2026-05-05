# Haytham Weekly Review - Saturday, May 2nd

## Overview

This document organizes the website feedback from the weekly review meeting into clear action items by area.

## 1. Navigation

- Improve the navigation bar overall.
- Review the navigation component structure and implementation.
- Prefer a cleaner component system using Tailwind CSS and Headless UI where appropriate.

## 2. Shop / Collection Page

- Fix the shop page so products and product images are displayed properly and prioritized visually.
- Move product categories to the left side of the screen.
- Keep categories always accessible while scrolling, likely with a sticky sidebar.
- Add a button on the right side of the page, ideally in a corner, that scrolls the user back to the top.
- Make the "52 piece section" clickable and give it a clear purpose.
- Increase the number of product cards per row to at least 5 items.
- To support denser product rows, remove the always-visible product description.
- Show the description only on hover, ideally appearing over the lower part of the product image/card.
- Add pagination or a "show more" / "load more" feature so large product lists are easier to browse.

## 3. PDP (Product Detail Page)

- Product pictures should change on hover, not only on click.

## 4. Contact Page

- Improve the contact page overall, especially for order help flows.
- Add an order number field for users requesting order support.
- Validation/help text under the input fields should be in red.
- Required field asterisks should be clearly visible.
- Fix the bug where the contact page misbehaves when clicking on the name field and then the email field.
- Add the WhatsApp logo for the WhatsApp contact option.
- Make sure the displayed business hours use local time, not CET.

## 5. Post-Submission / Conversion Flow

- After contact form submission, do not show only links to other products.
- Instead, visibly display recommended products that encourage users to continue shopping.

## 6. Product Recommendations

- Recommended products should be based on:
  - Product categories
  - Actual products
  - Each specific customer's history

## 7. Suggested Priority Order

### High Priority

- Navigation bar improvements
- Shop page layout and product display fixes
- Sticky category sidebar
- Product grid density changes
- Contact page bug fixes
- Order help improvements on contact page

### Medium Priority

- Back-to-top button
- Hover-based product description reveal
- PDP hover image behavior
- WhatsApp logo
- Local-time business hours
- Pagination or "show more" functionality

### Longer-Term / Strategy

- Smarter product recommendations based on category, product relevance, and customer history
- Better post-submission product merchandising

## 8. Implementation Notes

- The shop page updates are primarily UX and layout improvements.
- The recommendation system likely requires both frontend and backend/data logic.
- The contact page issues include both UX polish and functional bug fixing.
