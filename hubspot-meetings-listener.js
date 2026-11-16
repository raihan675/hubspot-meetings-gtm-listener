/**
 * HubSpot Meetings Multi-Step Funnel Tracking Listener
 * 
 * Tracks the complete user scheduling journey across embedded HubSpot booking calendars:
 * - Step 1: calender view (Calendar loaded / viewed)
 * - Step 2: date and time select (Time slot selected -> Contact form revealed)
 * - Step 3: booking_confirmed (Confirmed appointment with user contact details)
 * 
 * Works universally across 1-on-1, Round Robin, Group, and Custom CNAME domains.
 * 
 * @author Raihan Ahmed (https://github.com/raihan675)
 * @license MIT
 * @repository https://github.com/raihan675/hubspot-meetings-gtm-listener
 */

(function (window, document) {
  'use strict';

  // State flags to guarantee strictly single-fire events per lifecycle step
  var isIframeInteracted = false;
  var step1Fired = false;
  var step2Fired = false;
  var step3Fired = false;

  // Track when visitor interacts with (focuses/clicks) the calendar iframe
  window.addEventListener('blur', function () {
    if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
      isIframeInteracted = true;
    }
  });

  // Main postMessage event router
  window.addEventListener('message', function (event) {
    if (!event.data) return;

    // ========================================================
    // STEP 1: Calender View
    // Dispatched when the HubSpot calendar iframe completes its initial handshake
    // ========================================================
    if (!step1Fired && (event.data === 'readyForConsentListener' || (event.data && event.data.type === 'iframe-title'))) {
      step1Fired = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'hubspot_meeting_step_1',
        meeting_step: 1,
        step_name: 'calender view',
        booking_page_url: window.location.href
      });

      if (window.console && typeof window.console.log === 'function') {
        window.console.log('[HubSpot Funnel] Step 1: calender view');
      }
    }

    // ========================================================
    // STEP 2: Date and Time Select
    // Dispatched when the visitor clicks a date & time slot to reveal the contact form
    // ========================================================
    if (step1Fired && !step2Fired && !step3Fired) {
      if (typeof event.data === 'object' && event.data.height && isIframeInteracted) {
        step2Fired = true;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'hubspot_meeting_step_2',
          meeting_step: 2,
          step_name: 'date and time select',
          booking_page_url: window.location.href
        });

        if (window.console && typeof window.console.log === 'function') {
          window.console.log('[HubSpot Funnel] Step 2: date and time select');
        }
      }
    }

    // ========================================================
    // STEP 3: Booking Confirmed
    // Dispatched upon successful submission of the meeting reservation
    // ========================================================
    if (!step3Fired && event.data.meetingBookSucceeded === true) {
      step3Fired = true;
      var payload = event.data.meetingsPayload || {};
      var bookingResponse = payload.bookingResponse || {};
      var postResponse = bookingResponse.postResponse || {};
      var contact = postResponse.contact || {};
      var timerange = postResponse.timerange || {};
      var meetingEvent = bookingResponse.event || {};

      // Compute standard metrics
      var durationMinutes = meetingEvent.duration ? Math.round(meetingEvent.duration / 60000) : null;
      var startTimeIso = timerange.start ? new Date(timerange.start).toISOString() : null;
      var endTimeIso = timerange.end ? new Date(timerange.end).toISOString() : null;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'hubspot_meeting_step_3',
        meeting_step: 3,
        step_name: 'booking_confirmed',
        // Meeting Identifiers
        meeting_slug: payload.userSlug || '',
        meeting_link_type: payload.linkType || 'PERSONAL_LINK',
        form_guid: payload.formGuid || '',
        is_paid_meeting: Boolean(payload.isPaidMeeting),
        // Booking Schedule
        meeting_date: meetingEvent.dateString || '',
        meeting_duration_minutes: durationMinutes,
        meeting_start_time: startTimeIso,
        meeting_end_time: endTimeIso,
        // User Data for Google Ads Enhanced Conversions & Meta Advanced Matching
        user_data: {
          email: contact.email || '',
          first_name: contact.firstName || '',
          last_name: contact.lastName || ''
        }
      });

      if (window.console && typeof window.console.log === 'function') {
        window.console.log('[HubSpot Funnel] Step 3: booking_confirmed', {
          user: contact.email,
          duration: durationMinutes + ' mins',
          start: startTimeIso
        });
      }
    }
  });
})(window, document);
