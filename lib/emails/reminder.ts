/**
 * Reminder and happy-birthday email bodies.
 *
 * Self-contained HTML (table based, responsive, inline styles) plus a matching
 * plain-text alternative. The templates deliberately use the product's solid
 * blue brand colour and cream/white surfaces instead of gradients, and rely on
 * system-friendly fonts so they render consistently in every mail client.
 */

import { sanitizeHeaderValue } from "../reminders";

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

const BRAND = "#0068c4";
const BRAND_DARK = "#163455";
const INK = "#1a1c23";
const BODY = "#3f444d";
const MUTED = "#62666f";
const BORDER = "#e8e2d6";
const HAIRLINE = "#edf0f4";
const CANVAS = "#f7f3ec";
const SURFACE = "#ffffff";
const ACCENT = "#e8f1fc";
const FONT = "Helvetica, Arial, sans-serif";

/* -------------------------------------------------------------------------- */
/* Public types                                                               */
/* -------------------------------------------------------------------------- */

export interface ReminderEmailData {
  /** Recipient address. Only the local part is used, as a greeting. */
  user: string;
  /** Birthday names falling today (raw stored names, no punctuation). */
  today: string[];
  /** Birthdays in the next three days. */
  upcoming: { name: string; daysUntil: number; dateLabel: string }[];
  /** Recipient timezone, e.g. `Asia/Kolkata`. */
  timezone: string;
  /** Public site origin, e.g. `https://slax.studio`. */
  siteUrl: string;
}

export interface BirthdayEmailData {
  /** Recipient address. */
  user: string;
  /** Birthday person / account owner's name. */
  name: string;
  /** Recipient timezone, e.g. `Asia/Kolkata`. */
  timezone: string;
  /** Public site origin, e.g. `https://slax.studio`. */
  siteUrl: string;
}

type Variant = "today" | "tomorrow" | "upcoming" | "mixed" | "empty";

interface UpcomingBirthday {
  name: string;
  daysUntil: number;
  dateLabel: string;
}

interface ReminderContent {
  variant: Variant;
  subject: string;
  preheader: string;
  eyebrow: string;
  heading: string;
  intro: string;
  today: string[];
  upcoming: UpcomingBirthday[];
}

/* -------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* -------------------------------------------------------------------------- */

function copyrightYear(): number {
  return new Date().getFullYear();
}

/**
 * Escape user-provided text before interpolating it into the HTML bodies.
 * Names come from the database, so a stored `<script>` (or an `&`, quote or
 * apostrophe) must render as text rather than become markup.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Collapse control characters and runs of whitespace for text/subjects. */
function cleanText(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A stored name, made safe for a mail header. */
function headerName(name: string): string {
  return sanitizeHeaderValue(cleanText(name).replace(/[<>]/g, ""), 60);
}

/**
 * Normalise the caller-supplied origin. We only accept absolute http(s) URLs
 * (query strings are not expected) and fall back to the production origin so a
 * broken config can never turn into a `javascript:` link in an email.
 */
function normalizeSiteUrl(value: string): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  const withoutSlash = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\/[^\s"'<>]+$/i.test(withoutSlash)) {
    return withoutSlash;
  }
  return "https://slax.studio";
}

/** Greeting handle derived from the recipient address. */
function greetingFromEmail(user: string): string {
  const at = user.indexOf("@");
  const localPart = (at > 0 ? user.slice(0, at) : user).trim();
  return localPart.length > 0 ? localPart : "there";
}

function relativeDayLabel(daysUntil: number): string {
  const days = Math.max(0, Math.trunc(daysUntil));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

/* -------------------------------------------------------------------------- */
/* Content selection                                                          */
/* -------------------------------------------------------------------------- */

function pickVariant(today: string[], upcoming: UpcomingBirthday[]): Variant {
  if (today.length > 0 && upcoming.length > 0) return "mixed";
  if (today.length > 0) return "today";
  if (upcoming.length > 0) {
    if (upcoming.length === 1 && upcoming[0].daysUntil === 1) return "tomorrow";
    return "upcoming";
  }
  return "empty";
}

function reminderSubject(
  variant: Variant,
  today: string[],
  upcoming: UpcomingBirthday[]
): string {
  let subject: string;
  switch (variant) {
    case "today":
      subject =
        today.length === 1
          ? `🎂 ${headerName(today[0])}'s birthday is today`
          : `🎂 ${today.length} birthdays today`;
      break;
    case "tomorrow":
      subject = `${headerName(upcoming[0].name)}'s birthday is tomorrow`;
      break;
    case "upcoming":
      subject =
        upcoming.length === 1
          ? `${headerName(upcoming[0].name)}'s birthday is in ${
              upcoming[0].daysUntil
            } days`
          : "Upcoming birthdays this week";
      break;
    case "mixed":
      subject = "Today + upcoming birthdays";
      break;
    default:
      subject = "Your Slax birthday reminders";
      break;
  }
  // Stored names are untrusted: strip CR/LF before the value reaches a header.
  return sanitizeHeaderValue(subject, 90);
}

function reminderPreheader(
  variant: Variant,
  today: string[],
  upcoming: UpcomingBirthday[]
): string {
  switch (variant) {
    case "today":
      return today.length === 1
        ? `${cleanText(today[0])}'s birthday is today.`
        : `${today.length} birthdays today, including ${cleanText(
            today[0]
          )}.`;
    case "tomorrow":
      return `${cleanText(upcoming[0].name)}'s birthday is tomorrow.`;
    case "upcoming":
      return upcoming.length === 1
        ? `${cleanText(upcoming[0].name)}'s birthday is in ${
            upcoming[0].daysUntil
          } days.`
        : `${upcoming.length} birthdays coming up this week.`;
    case "mixed":
      return `${today.length} today and ${upcoming.length} coming up.`;
    default:
      return "Birthdays worth remembering, gathered in one place.";
  }
}

function reminderHeading(variant: Variant, today: string[]): string {
  switch (variant) {
    case "today":
      return today.length === 1
        ? "Today's the day."
        : "A few candles to blow out.";
    case "tomorrow":
      return "Tomorrow's the big day.";
    case "upcoming":
      return "Birthdays on the horizon.";
    case "mixed":
      return "Today, and the days ahead.";
    default:
      return "Birthdays worth remembering.";
  }
}

function reminderIntro(
  variant: Variant,
  today: string[],
  upcoming: UpcomingBirthday[]
): string {
  switch (variant) {
    case "today":
      if (today.length === 1) {
        return `${escapeHtml(
          cleanText(today[0])
        )} is celebrating today. A quick message now means more than a late one tomorrow.`;
      }
      return `${today.length} people on your list are celebrating today. There is still time to say something lovely.`;
    case "tomorrow":
      return `${escapeHtml(
        cleanText(upcoming[0].name)
      )} is celebrating tomorrow. You are already ahead of the last-minute scramble.`;
    case "upcoming":
      return upcoming.length === 1
        ? `${escapeHtml(
            cleanText(upcoming[0].name)
          )} has a birthday in ${upcoming[0].daysUntil} days. A little notice goes a long way.`
        : `${upcoming.length} birthdays are coming up in the next few days. Here is your head start.`;
    case "mixed":
      return "There is a birthday today, and a few more just around the corner. No scrambling required.";
    default:
      return "Nothing on the calendar just yet. We will let you know when a birthday gets close.";
  }
}

function buildReminderContent(data: ReminderEmailData): ReminderContent {
  const today = (Array.isArray(data.today) ? data.today : [])
    .filter((name): name is string => typeof name === "string")
    .map(cleanText)
    .filter((name) => name.length > 0);

  const upcoming = (Array.isArray(data.upcoming) ? data.upcoming : [])
    .filter(
      (item): item is ReminderEmailData["upcoming"][number] =>
        item !== null && typeof item === "object"
    )
    .map((item) => ({
      name: cleanText(item.name),
      daysUntil: Number.isFinite(item.daysUntil) ? item.daysUntil : 1,
      dateLabel: cleanText(item.dateLabel),
    }))
    .filter((item) => item.name.length > 0);

  const variant = pickVariant(today, upcoming);

  return {
    variant,
    subject: reminderSubject(variant, today, upcoming),
    preheader: reminderPreheader(variant, today, upcoming),
    eyebrow:
      variant === "today" || variant === "mixed"
        ? "Birthday reminder · today"
        : "Birthday reminder",
    heading: reminderHeading(variant, today),
    intro: reminderIntro(variant, today, upcoming),
    today,
    upcoming,
  };
}

/* -------------------------------------------------------------------------- */
/* HTML fragments                                                             */
/* -------------------------------------------------------------------------- */

function todaySectionHtml(names: string[]): string {
  const rows = names
    .map(
      (name) => `<div style="font-family:${FONT};font-size:16px;line-height:24px;font-weight:600;color:${INK};padding-top:10px;"><span style="color:${BRAND};font-weight:700;">&#8226;</span>&nbsp;&nbsp;${escapeHtml(
        name
      )}</div>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;background-color:${ACCENT};border-left:3px solid ${BRAND};border-radius:0 10px 10px 0;">
  <tr>
    <td class="section-pad" style="padding:18px 20px 20px 20px;">
      <div style="font-family:${FONT};font-size:10px;line-height:14px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND};">Today</div>
      <div style="font-family:${FONT};font-size:15px;line-height:21px;font-weight:700;color:${BRAND_DARK};padding-top:5px;">Make sure you wish them today</div>
      ${rows}
    </td>
  </tr>
</table>`;
}

function upcomingSectionHtml(items: UpcomingBirthday[]): string {
  const rows = items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      const border = isLast ? "0" : `1px solid ${HAIRLINE}`;
      return `<tr>
        <td class="detail-cell" style="padding:12px 0;border-bottom:${border};vertical-align:top;">
          <div style="font-family:${FONT};font-size:16px;line-height:22px;font-weight:600;color:${INK};">${escapeHtml(
            item.name
          )}</div>
          <div style="font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};padding-top:2px;">${escapeHtml(
            item.dateLabel
          )}</div>
        </td>
        <td class="detail-cell" align="right" style="padding:12px 0;border-bottom:${border};vertical-align:top;white-space:nowrap;">
          <span style="display:inline-block;padding:5px 11px;border-radius:999px;background-color:${ACCENT};font-family:${FONT};font-size:12px;line-height:16px;font-weight:700;color:${BRAND};">${relativeDayLabel(
            item.daysUntil
          )}</span>
        </td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
  <tr>
    <td style="padding:0 0 2px 0;">
      <div style="font-family:${FONT};font-size:10px;line-height:14px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND};">Next 3 days</div>
      <div style="font-family:${FONT};font-size:15px;line-height:21px;font-weight:700;color:${INK};padding-top:5px;">Coming up</div>
    </td>
  </tr>
  ${rows}
</table>`;
}

function sectionsHtml(content: ReminderContent): string {
  const sections: string[] = [];
  if (content.today.length > 0) {
    sections.push(todaySectionHtml(content.today));
  }
  if (content.upcoming.length > 0) {
    sections.push(upcomingSectionHtml(content.upcoming));
  }
  return sections.join(
    `<div style="height:16px;line-height:16px;font-size:16px;">&nbsp;</div>`
  );
}

function ctaHtml(dashboardUrl: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
  <tr>
    <td align="center" bgcolor="${BRAND}" style="border-radius:9px;">
      <a class="cta-link" href="${escapeHtml(
        dashboardUrl
      )}" target="_blank" rel="noopener" style="display:inline-block;padding:13px 26px;border-radius:9px;background-color:${BRAND};font-family:${FONT};font-size:15px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;">Open Slax</a>
    </td>
  </tr>
</table>`;
}

function footerHtml(dashboardUrl: string): string {
  return `<p style="margin:0;font-family:${FONT};font-size:12px;line-height:19px;color:${MUTED};">You&#39;re receiving this because you have a Slax account.</p>
<p style="margin:8px 0 0 0;font-family:${FONT};font-size:12px;line-height:19px;color:${MUTED};"><a href="${escapeHtml(
    dashboardUrl
  )}" target="_blank" rel="noopener" style="color:${BRAND};text-decoration:underline;">Manage reminders</a></p>
<p style="margin:14px 0 0 0;font-family:${FONT};font-size:12px;line-height:19px;color:${MUTED};">&#169; ${copyrightYear()} Slax. All rights reserved.</p>`;
}

interface DocumentOptions {
  subject: string;
  preheader: string;
  eyebrow: string;
  /** Optional "Hey name," line, already escaped. */
  greetingHtml?: string;
  headingHtml: string;
  introHtml: string;
  sectionsHtml: string;
  dashboardUrl: string;
  siteUrl: string;
}

function renderDocument(options: DocumentOptions): string {
  const logoUrl = `${options.siteUrl}/logo.png`;
  const preheaderPadding = "&#847;&zwnj;&nbsp;".repeat(16);

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(options.subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: ${BRAND}; }
    @media only screen and (max-width: 420px) {
      .email-wrap { padding: 16px 10px !important; }
      .card-pad { padding-left: 22px !important; padding-right: 22px !important; }
      .hero-heading { font-size: 24px !important; line-height: 31px !important; }
      .section-pad { padding: 16px 16px 18px 16px !important; }
      .detail-cell { display: block !important; width: 100% !important; text-align: left !important; border-bottom: 0 !important; padding: 10px 0 0 0 !important; }
      .cta-link { padding: 14px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${CANVAS};">
  <div style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:${CANVAS};">${escapeHtml(
    options.preheader
  )}${preheaderPadding}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CANVAS}" style="width:100%;background-color:${CANVAS};border-collapse:collapse;">
    <tr>
      <td align="center" class="email-wrap" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${SURFACE}" style="width:100%;max-width:600px;background-color:${SURFACE};border:1px solid ${BORDER};border-radius:16px;border-collapse:separate;">
          <tr>
            <td style="height:4px;line-height:4px;font-size:4px;background-color:${BRAND};border-radius:16px 16px 0 0;">&nbsp;</td>
          </tr>
          <tr>
            <td class="card-pad" style="padding:24px 34px 0 34px;">
              <a href="${escapeHtml(
                options.siteUrl
              )}" target="_blank" rel="noopener" style="text-decoration:none;"><img src="${escapeHtml(
    logoUrl
  )}" width="72" height="72" alt="Slax" style="display:block;width:72px;height:72px;border:0;outline:none;text-decoration:none;"></a>
            </td>
          </tr>
          <tr>
            <td class="card-pad" style="padding:20px 34px 0 34px;">
              <div style="font-family:${FONT};font-size:10px;line-height:14px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND};">${escapeHtml(
    options.eyebrow
  )}</div>
              ${
                options.greetingHtml
                  ? `<div style="font-family:${FONT};font-size:15px;line-height:22px;color:${MUTED};padding-top:10px;">${options.greetingHtml}</div>`
                  : ""
              }
              <h1 class="hero-heading" style="margin:${
                options.greetingHtml ? "6px" : "10px"
              } 0 0 0;font-family:${FONT};font-size:28px;line-height:36px;font-weight:700;letter-spacing:-0.4px;color:${INK};">${
    options.headingHtml
  }</h1>
              <p style="margin:12px 0 0 0;font-family:${FONT};font-size:15px;line-height:23px;color:${BODY};">${
                options.introHtml
              }</p>
            </td>
          </tr>
          <tr>
            <td class="card-pad" style="padding:24px 34px 0 34px;">
              ${options.sectionsHtml}
            </td>
          </tr>
          <tr>
            <td class="card-pad" style="padding:28px 34px 0 34px;">
              ${ctaHtml(options.dashboardUrl)}
            </td>
          </tr>
          <tr>
            <td class="card-pad" style="padding:26px 34px 0 34px;">
              <div style="height:1px;line-height:1px;font-size:1px;background-color:${HAIRLINE};mso-line-height-rule:exactly;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td class="card-pad" style="padding:18px 34px 28px 34px;">
              ${footerHtml(options.dashboardUrl)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* -------------------------------------------------------------------------- */
/* Reminder email                                                             */
/* -------------------------------------------------------------------------- */

export function buildReminderEmail(data: ReminderEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const siteUrl = normalizeSiteUrl(data.siteUrl);
  const dashboardUrl = `${siteUrl}/dashboard`;
  const content = buildReminderContent(data);

  const html = renderDocument({
    subject: content.subject,
    preheader: content.preheader,
    eyebrow: content.eyebrow,
    greetingHtml: `Hey ${escapeHtml(cleanText(greetingFromEmail(data.user)))},`,
    headingHtml: escapeHtml(content.heading),
    introHtml: content.intro,
    sectionsHtml: sectionsHtml(content),
    dashboardUrl,
    siteUrl,
  });

  const textLines: string[] = [];
  textLines.push(
    `Hey ${cleanText(greetingFromEmail(data.user))},`,
    ""
  );
  textLines.push(content.heading, "", cleanText(content.intro));

  if (content.today.length > 0) {
    textLines.push("", "Make sure you wish them today:");
    for (const name of content.today) {
      textLines.push(`- ${name}`);
    }
  }

  if (content.upcoming.length > 0) {
    textLines.push("", "Coming up:");
    for (const item of content.upcoming) {
      const label = relativeDayLabel(item.daysUntil);
      const date = item.dateLabel ? ` (${item.dateLabel})` : "";
      textLines.push(`- ${item.name} — ${label}${date}`);
    }
  }

  textLines.push(
    "",
    `Open Slax: ${dashboardUrl}`,
    "",
    "You're receiving this because you have a Slax account.",
    `Manage reminders: ${dashboardUrl}`,
    "",
    `© ${copyrightYear()} Slax. All rights reserved.`
  );

  return {
    subject: content.subject,
    html,
    text: `${textLines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`,
  };
}

/* -------------------------------------------------------------------------- */
/* Happy birthday email                                                       */
/* -------------------------------------------------------------------------- */

export function buildBirthdayEmail(data: BirthdayEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const siteUrl = normalizeSiteUrl(data.siteUrl);
  const dashboardUrl = `${siteUrl}/dashboard`;
  const name = cleanText(data.name) || "friend";
  const safeName = escapeHtml(name);
  const subject = sanitizeHeaderValue(`Happy Birthday, ${headerName(name)}! 🎉`, 90);

  const headingHtml = `Happy Birthday, ${safeName}! 🎉`;
  const introHtml =
    "Another trip around the sun. We hope today is slow in the best way — good food, favourite people, and a few minutes that are entirely yours.";
  const calloutHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;background-color:${ACCENT};border-left:3px solid ${BRAND};border-radius:0 10px 10px 0;">
  <tr>
    <td class="section-pad" style="padding:18px 20px;">
      <div style="font-family:${FONT};font-size:15px;line-height:22px;font-weight:600;color:${BRAND_DARK};">Make a wish. We&#39;ll take care of the reminders.</div>
      <div style="font-family:${FONT};font-size:13px;line-height:20px;color:${BODY};padding-top:5px;">— The Slax team</div>
    </td>
  </tr>
</table>`;

  const html = renderDocument({
    subject,
    preheader: `A small birthday note from Slax for ${name}.`,
    eyebrow: "A note from Slax",
    headingHtml,
    introHtml,
    sectionsHtml: calloutHtml,
    dashboardUrl,
    siteUrl,
  });

  const text = `Happy Birthday, ${name}! 🎉

Another trip around the sun. We hope today is slow in the best way — good food, favourite people, and a few minutes that are entirely yours.

Make a wish. We'll take care of the reminders.
— The Slax team

Open Slax: ${dashboardUrl}

You're receiving this because you have a Slax account.
Manage reminders: ${dashboardUrl}

© ${copyrightYear()} Slax. All rights reserved.
`;

  return { subject, html, text };
}
