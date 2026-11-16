# HubSpot Meetings Multi-Step GTM Funnel Listener

A lightweight, universal, zero-dependency tracking listener for embedded **HubSpot Meetings & Scheduling Calendars**. 

Tracks the complete visitor journey across **Google Tag Manager (GTM)**, **Google Analytics 4 (GA4)**, **Google Ads Enhanced Conversions**, and **Meta Pixel / Conversions API (CAPI)**.

[![GitHub License](https://img.shields.io/github/license/raihan675/hubspot-meetings-gtm-listener)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/raihan675/hubspot-meetings-gtm-listener)](https://github.com/raihan675/hubspot-meetings-gtm-listener/stargazers)

---

## 🚀 Key Features

* **Complete Multi-Step Funnel Tracking**:
  * **Step 1:** `calender view` — When visitor views the calendar.
  * **Step 2:** `date and time select` — When visitor selects a time slot and opens the contact form.
  * **Step 3:** `booking_confirmed` — When the appointment is successfully confirmed.
* **100% Universal Compatibility**: Works with 1-on-1 personal links, Round Robin team links, group meetings, and custom CNAME scheduling domains (e.g., `mail.yourdomain.com`).
* **High-Match Attribution**: Automatically captures verified `email`, `first_name`, and `last_name` in Step 3 for **Google Ads Enhanced Conversions** and **Meta Advanced Matching**.
* **Zero DOM Scraping**: Built entirely on HubSpot's official `window.postMessage` lifecycle architecture.
* **Ad-blocker & Privacy Compliant**: Omits sensitive identifiers not provided by the iframe while respecting visitor consent boundaries.

---

## 📊 Funnel Steps & DataLayer Schema

### Step 1: `calender view`
Triggered automatically when the HubSpot scheduler iframe loads and is visible to the visitor.

```javascript
window.dataLayer.push({
  event: "hubspot_meeting_step_1",
  meeting_step: 1,
  step_name: "calender view",
  booking_page_url: "https://example.com/book-appointment/"
});
```

---

### Step 2: `date and time select`
Triggered when the visitor selects an available date and time slot, which opens the contact details form.

```javascript
window.dataLayer.push({
  event: "hubspot_meeting_step_2",
  meeting_step: 2,
  step_name: "date and time select",
  booking_page_url: "https://example.com/book-appointment/"
});
```

---

### Step 3: `booking_confirmed`
Triggered immediately upon successful booking submission.

```javascript
window.dataLayer.push({
  event: "hubspot_meeting_step_3",
  meeting_step: 3,
  step_name: "booking_confirmed",
  // Meeting Identifiers
  meeting_slug: "enquiries154",
  meeting_link_type: "PERSONAL_LINK",
  form_guid: "a07a6bc5-3741-4f26-9242-94bc9f71ece7",
  is_paid_meeting: false,
  // Timing Details
  meeting_date: "2026-11-16",
  meeting_duration_minutes: 15,
  meeting_start_time: "2026-11-16T05:15:00.000Z",
  meeting_end_time: "2026-11-16T05:30:00.000Z",
  // User Data (Enhanced Conversions / Advanced Matching ready)
  user_data: {
    email: "visitor@example.com",
    first_name: "John",
    last_name: "Doe"
  }
});
```

---

## 🛠 Installation Guide

### Method A: Google Tag Manager (Recommended)

1. Open your **Google Tag Manager** container.
2. Go to **Tags** > click **New**.
3. Select Tag Type: **Custom HTML**.
4. Paste the minified code from [`hubspot-meetings-listener.min.js`](hubspot-meetings-listener.min.js) wrapped in `<script>` tags:
   ```html
   <script>
   // Paste content of hubspot-meetings-listener.min.js here
   </script>
   ```
5. Trigger: **Page View** or **DOM Ready** (on pages containing the HubSpot meeting calendar, or on *All Pages*).
6. Save and publish.

---

### Method B: Direct Site Embed (WordPress / Theme)

Add this directly into your theme's `footer.php`, child theme, or via a script manager plugin:

```html
<script src="https://cdn.jsdelivr.net/gh/raihan675/hubspot-meetings-gtm-listener@main/hubspot-meetings-listener.min.js"></script>
```

---

## 🎯 Configuring GTM Tags & Triggers

### 1. Triggers
Create 3 **Custom Event** triggers:
* **Trigger 1:** Event name = `hubspot_meeting_step_1`
* **Trigger 2:** Event name = `hubspot_meeting_step_2`
* **Trigger 3:** Event name = `hubspot_meeting_step_3`

---

### 2. DataLayer Variables (GTM)
Create the following **Data Layer Variables**:
* `dlv - email`: Variable Name = `user_data.email`
* `dlv - first_name`: Variable Name = `user_data.first_name`
* `dlv - last_name`: Variable Name = `user_data.last_name`
* `dlv - meeting_date`: Variable Name = `meeting_date`
* `dlv - meeting_duration`: Variable Name = `meeting_duration_minutes`

---

### 3. GA4 Event Tags
* **Step 1:** GA4 Event tag → Event Name: `view_item` or `hubspot_calendar_view` (Trigger: Step 1)
* **Step 2:** GA4 Event tag → Event Name: `begin_checkout` or `hubspot_slot_selected` (Trigger: Step 2)
* **Step 3:** GA4 Event tag → Event Name: `generate_lead` or `hubspot_meeting_booked` (Trigger: Step 3)

---

### 4. Meta (Facebook) Pixel Setup
* **Step 1:** Meta Pixel tag → `ViewContent` (Trigger: Step 1)
* **Step 2:** Meta Pixel tag → `InitiateCheckout` (Trigger: Step 2)
* **Step 3:** Meta Pixel tag → **`Schedule`** or **`Lead`** (Trigger: Step 3)
  * Enable **Advanced Matching**:
    * Email: `{{dlv - email}}`
    * First Name: `{{dlv - first_name}}`
    * Last Name: `{{dlv - last_name}}`

---

### 5. Google Ads Enhanced Conversions
Under your **Google Ads Conversion Tracking Tag**:
1. Check **Include user-provided data from your website**.
2. Select or create a **User-Provided Data Variable**.
3. Map:
   * **Email:** `{{dlv - email}}`
   * **First Name:** `{{dlv - first_name}}`
   * **Last Name:** `{{dlv - last_name}}`

---

## 🧪 Console Testing Snippet

Test without booking a real slot. Open browser DevTools (`F12` > Console) on your site and paste:

```javascript
// Test Step 1
window.dataLayer.push({ event: "hubspot_meeting_step_1", meeting_step: 1, step_name: "calender view" });

// Test Step 2
window.dataLayer.push({ event: "hubspot_meeting_step_2", meeting_step: 2, step_name: "date and time select" });

// Test Step 3
window.dataLayer.push({
  event: "hubspot_meeting_step_3",
  meeting_step: 3,
  step_name: "booking_confirmed",
  meeting_slug: "test-slug",
  meeting_date: "2026-11-16",
  user_data: {
    email: "test@example.com",
    first_name: "John",
    last_name: "Doe"
  }
});
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
