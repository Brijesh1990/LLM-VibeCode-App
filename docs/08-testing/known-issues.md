# Known Issues, Limitations & Future Roadmap (`known-issues.md`)

**Document Version:** 1.0.0  
**Project:** Enterprise LMS  

---

## 1. Known Operational Limitations (Current Release v1.0.0)

| ID | Area | Description | Severity | Mitigation / Workaround |
| :--- | :--- | :--- | :---: | :--- |
| `KI-001` | Video Streaming | Lecture videos rely on external stream URLs (MP4/HLS/YouTube/Vimeo embeds) or static file serving rather than a built-in adaptive HLS transcoder. | Low | Host large lecture videos on CDN/S3 or Vimeo/Cloudflare Stream and store the stream URL in `lectures.video_url`. |
| `KI-002` | Quiz Anti-Cheat | Browser focus/tab-switch (`visibilitychange`) and fullscreen telemetry cannot detect secondary physical devices (e.g., a mobile phone off-screen). | Low | Combine anti-cheat event thresholds (`max_warnings = 3`) with tight `time_limit_minutes` and randomized question order. |
| `KI-003` | Payment Gateway | Online payments record gateway transaction references (`transaction_ref`) without live Stripe/Razorpay webhook signature verification in offline dev mode. | Low | Configure production webhook secret keys in `.env` when integrating live Razorpay/Stripe checkout. |
| `KI-004` | Email Delivery | Password reset and notification alerts log to the console / database (`notifications` table) when `SMTP_ENABLED=false`. | Low | Enable SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`) in `.env` for production outbound emails. |

---

## 2. Phase 2 Enhancement Roadmap
1. **Live WebRTC Virtual Classroom:** Direct Zoom / Jitsi Meet SDK integration inside the batch lecture player with automated attendance check-in.
2. **AI Automated Rubric Assistant:** LLM-powered preliminary code/essay review suggestions for instructors in the Assignment Grading Studio.
3. **Multi-Currency & Automated Tax Invoicing:** Dynamic GST/VAT breakdown on `payment_receipts` PDF vouchers.
