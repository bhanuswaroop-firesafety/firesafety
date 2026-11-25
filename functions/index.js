/**
 * Sri Udharchi Enterprises - Cloud Functions (v2)
 * Task E: Daily Scheduled Equipment Refill & AMC Maintenance Alerts
 * Timezone: Asia/Kolkata (+05:30)
 * Uses firebase-functions v5/v6 with params & defineSecret
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Define Secrets and Environment Parameters
const smtpPass = defineSecret("SMTP_PASS");
const smtpUser = defineString("SMTP_USER", { default: "sriudharchienterprises@gmail.com" });
const adminEmail = defineString("ADMIN_EMAIL", { default: "bhanuswaroop04@gmail.com" });
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");
const razorpayKeyId = defineString("RAZORPAY_KEY_ID", { default: "rzp_test_TsSdQPZMXEYn5z" });
const crypto = require("crypto");

/**
 * Compute current date in Asia/Kolkata timezone (YYYY-MM-DD)
 */
function getKolkataDateString() {
  const now = new Date();
  return now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getKolkataISOString() {
  return new Date().toISOString();
}

/**
 * Setup Email Transport using defineSecret and defineString with environment and settings fallbacks
 */
function getEmailTransporter(contactInfo) {
  try {
    let user = "";
    let pass = "";
    try {
      user = smtpUser.value();
    } catch (e) {}
    try {
      pass = smtpPass.value();
    } catch (e) {}

    if (!user && contactInfo && contactInfo.smtpUser) user = contactInfo.smtpUser;
    if (!pass && contactInfo && contactInfo.smtpPass) pass = contactInfo.smtpPass;
    if (!user) user = process.env.SMTP_USER || "sriudharchienterprises@gmail.com";
    if (!pass) pass = process.env.SMTP_PASS || "";

    if (user && pass) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    }
  } catch (err) {
    console.warn("[Email Service] Email transport not configured or secret missing:", err.message);
  }
  return null;
}

/**
 * Retrieve live Contact & Support Settings from Firestore (settings/contact)
 */
async function getLiveContactSettings() {
  try {
    const snap = await db.collection("settings").doc("contact").get();
    if (snap.exists) {
      const data = snap.data();
      return {
        supportPhone: data.supportPhone || "+91 8639858221",
        supportEmail: data.supportEmail || "sriudharchienterprises@gmail.com",
        adminEmail: data.adminEmail || "bhanuswaroop04@gmail.com",
        smtpUser: data.smtpUser || "",
        smtpPass: data.smtpPass || "",
      };
    }
  } catch (e) {
    console.warn("[Contact Settings] Could not fetch settings/contact, using defaults:", e.message);
  }
  return {
    supportPhone: "+91 8639858221",
    supportEmail: "sriudharchienterprises@gmail.com",
    adminEmail: "bhanuswaroop04@gmail.com",
  };
}

/**
 * Core alert dispatcher function with atomic idempotency
 */
async function processDueReminders() {
  const today = getKolkataDateString();
  const nowIso = getKolkataISOString();
  console.log(`[Task E] Running daily renewal reminders check for date: ${today}`);

  const snapshot = await db
    .collection("reminders")
    .where("status", "==", "pending")
    .where("alertDate", "<=", today)
    .get();

  if (snapshot.empty) {
    console.log("[Task E] No pending equipment reminders due today.");
    return { processed: 0 };
  }

  console.log(`[Task E] Found ${snapshot.size} due reminder(s) to process.`);
  const contactInfo = await getLiveContactSettings();
  const transporter = getEmailTransporter(contactInfo);
  let processedCount = 0;

  for (const docSnap of snapshot.docs) {
    const reminderId = docSnap.id;
    let reminderData = docSnap.data();

    // Idempotent Atomic Lock via Firestore Transaction:
    // Only proceed if status is verified "pending" inside the transaction
    let acquired = false;
    try {
      await db.runTransaction(async (transaction) => {
        const docRef = db.collection("reminders").doc(reminderId);
        const freshSnap = await transaction.get(docRef);
        if (!freshSnap.exists || freshSnap.data().status !== "pending") {
          return;
        }
        transaction.update(docRef, {
          status: "sent",
          lastAlertSentAt: nowIso,
          updatedAt: nowIso,
        });
        reminderData = freshSnap.data();
        acquired = true;
      });
    } catch (txErr) {
      console.warn(`[Task E] Transaction lock failed for reminder ${reminderId}:`, txErr.message);
      continue;
    }

    if (!acquired) {
      // Already sent by another concurrent worker
      continue;
    }

    // 1. In-App Notification for Customer (notifications/{id})
    if (reminderData.userId && reminderData.userId !== "guest") {
      const custNotifId = `NOTIF-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;
      await db.collection("notifications").doc(custNotifId).set({
        id: custNotifId,
        userId: reminderData.userId,
        title: "Upcoming Safety Refill / Inspection Due",
        message: `Your ${reminderData.productName || "Safety Equipment"} (Order #${reminderData.orderId}) is scheduled for refill/renewal on ${reminderData.renewalDate}. Contact Sri Udharchi Enterprises at ${contactInfo.supportPhone} to maintain statutory fire safety compliance.`,
        type: "renewal",
        orderId: reminderData.orderId,
        reminderId: reminderId,
        read: false,
        createdAt: nowIso,
      });
    }

    // 2. In-App Notification for Executive Admin (notifications/{id})
    const adminNotifId = `NOTIF-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;
    await db.collection("notifications").doc(adminNotifId).set({
      id: adminNotifId,
      userId: "admin",
      title: `Equipment Refill Due: ${reminderData.customerName || "Client"}`,
      message: `Order #${reminderData.orderId} (${reminderData.productName}) has scheduled renewal on ${reminderData.renewalDate}. Customer Phone: ${reminderData.customerPhone || "N/A"}.`,
      type: "renewal",
      orderId: reminderData.orderId,
      reminderId: reminderId,
      read: false,
      createdAt: nowIso,
    });

    // 3. Email Notification to Customer & Admin
    if (transporter) {
      const senderEmail = smtpUser.value() || contactInfo.supportEmail;

      if (reminderData.customerEmail && reminderData.customerEmail.includes("@")) {
        try {
          await transporter.sendMail({
            from: `"Sri Udharchi Enterprises" <${senderEmail}>`,
            to: reminderData.customerEmail,
            subject: `Action Required: Safety Equipment Maintenance & Refill Due - Order #${reminderData.orderId}`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
                <h2 style="color: #e11d48; margin-top: 0;">Sri Udharchi Enterprises</h2>
                <h3 style="color: #111;">Safety Inspection & Refill Due Notice</h3>
                <p>Dear <strong>${reminderData.customerName || "Valued Client"}</strong>,</p>
                <p>This is an automated advisory regarding your installed fire protection equipment from Order <strong>#${reminderData.orderId}</strong>.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                  <tr style="background: #f8f8f8;">
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Equipment Item</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${reminderData.productName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Installation / Commission Date</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${reminderData.installDate}</td>
                  </tr>
                  <tr style="background: #f8f8f8;">
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Renewal / Servicing Due Date</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd; color: #e11d48; font-weight: bold;">${reminderData.renewalDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Maintenance Cycle</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">Cycle #${reminderData.cycle || reminderData.cycleNumber || 1} (${reminderData.renewalMonths} Months)</td>
                  </tr>
                </table>
                <p>To ensure uninterrupted NBC 2016 and IS 15683 compliance, please schedule an authorized on-site inspection or cylinder refill with our certified safety engineers.</p>
                <p><strong>Hotline:</strong> ${contactInfo.supportPhone}<br/><strong>Email:</strong> ${contactInfo.supportEmail}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 11px; color: #888;">Sri Udharchi Enterprises (Proprietor: Dabbara Bhanu Swaroop) • Office &amp; Depot: H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241</p>
              </div>
            `,
          });
        } catch (mailErr) {
          console.error(`[Task E] Failed sending customer email for reminder ${reminderId}:`, mailErr.message);
        }
      }

      // Admin Email Alert
      try {
        await transporter.sendMail({
          from: `"Sri Udharchi System" <${senderEmail}>`,
          to: contactInfo.adminEmail,
          subject: `[Admin Alert] Equipment Refill Due for ${reminderData.customerName || "Client"} (#${reminderData.orderId})`,
          text: `Equipment: ${reminderData.productName}\nCustomer: ${reminderData.customerName}\nPhone: ${reminderData.customerPhone}\nEmail: ${reminderData.customerEmail}\nDue Date: ${reminderData.renewalDate}\nOrder ID: ${reminderData.orderId}`,
        });
      } catch (adminMailErr) {
        console.error(`[Task E] Failed sending admin email for reminder ${reminderId}:`, adminMailErr.message);
      }
    }

    processedCount++;
  }

  console.log(`[Task E] Successfully processed and marked 'sent' for ${processedCount} reminder(s).`);
  return { processed: processedCount };
}

/**
 * Scheduled Cloud Function (v2): Runs Daily at 08:00 AM Asia/Kolkata
 */
exports.dailyRenewalAlerts = onSchedule(
  {
    schedule: "0 8 * * *",
    timeZone: "Asia/Kolkata",
    memory: "256MiB",
    timeoutSeconds: 120,
    secrets: [smtpPass],
  },
  async () => {
    await processDueReminders();
  }
);

/**
 * HTTP Endpoint to allow manual on-demand trigger or webhook invocation
 */
exports.triggerRenewalAlertsManual = onRequest(
  {
    cors: true,
    secrets: [smtpPass],
  },
  async (req, res) => {
    try {
      const result = await processDueReminders();
      res.json({ success: true, ...result });
    } catch (err) {
      console.error("[Task E] Error triggering manual renewal alerts:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * HTTP Endpoint to create a verified Razorpay Order
 */
exports.createRazorpayOrder = onRequest(
  {
    cors: true,
    secrets: [razorpayKeySecret],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method Not Allowed" });
      return;
    }
    try {
      const { amount, currency = "INR", receipt, notes } = req.body || {};
      if (!amount || Number(amount) <= 0) {
        res.status(400).json({ success: false, error: "Invalid payment amount" });
        return;
      }

      const keyId = razorpayKeyId.value() || "rzp_test_TsSdQPZMXEYn5z";
      let keySecret = "";
      try {
        keySecret = razorpayKeySecret.value();
      } catch (e) {
        keySecret = process.env.RAZORPAY_KEY_SECRET || "CTT36f8FfIcQOV14B9u9FwUu";
      }

      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const resp = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: Math.round(Number(amount)),
          currency,
          receipt: String(receipt || Date.now()).slice(0, 40),
          notes: notes || {},
        }),
      });

      const orderData = await resp.json();
      if (!resp.ok) {
        console.error("[Razorpay] Order creation API failed:", orderData);
        res.status(resp.status).json({ success: false, error: orderData });
        return;
      }

      res.json({ success: true, order: orderData, keyId });
    } catch (err) {
      console.error("[Razorpay] Error in createRazorpayOrder:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * HTTP Endpoint to verify Razorpay signature and mark order paid
 */
exports.verifyRazorpayPayment = onRequest(
  {
    cors: true,
    secrets: [razorpayKeySecret],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method Not Allowed" });
      return;
    }
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderNumber } = req.body || {};
      if (!razorpay_payment_id) {
        res.status(400).json({ success: false, error: "Missing razorpay_payment_id" });
        return;
      }

      let keySecret = "";
      try {
        keySecret = razorpayKeySecret.value();
      } catch (e) {
        keySecret = process.env.RAZORPAY_KEY_SECRET || "CTT36f8FfIcQOV14B9u9FwUu";
      }

      let isValid = true;
      if (razorpay_order_id && razorpay_signature) {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(body)
          .digest("hex");
        isValid = expectedSignature === razorpay_signature;
      }

      if (isValid && orderNumber) {
        await db.collection("orders").doc(orderNumber).set(
          {
            paymentStatus: "paid",
            paymentMethod: "razorpay",
            paymentDetails: {
              gateway: "razorpay",
              paymentId: razorpay_payment_id,
              razorpayOrderId: razorpay_order_id || null,
              signature: razorpay_signature || null,
              paidAt: new Date().toISOString(),
              status: "captured",
            },
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      res.json({ success: isValid, valid: isValid });
    } catch (err) {
      console.error("[Razorpay] Error in verifyRazorpayPayment:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * Core Order Shipping Email Generator and Dispatcher
 */
async function sendShippingEmail(orderData, orderId) {
  const contactInfo = await getLiveContactSettings();
  const transporter = getEmailTransporter(contactInfo);
  const recipientEmail = orderData.customerEmail;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    console.warn(`[Order Dispatch] No valid customer email for order #${orderId}`);
    return { sent: false, reason: "No valid customer email address provided on order" };
  }

  const orderNum = orderData.orderNumber || orderId;
  const courier = orderData.courierName || "Express Courier Logistics";
  const awb = orderData.trackingNumber || "Pending Carrier Scan";
  const trackingUrl =
    orderData.trackingUrl ||
    `https://www.google.com/search?q=${encodeURIComponent(courier + " tracking " + awb)}`;
  const customerName = orderData.customerName || "Valued Client";
  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const dispatchNote = orderData.dispatchNote || "";
  const nowDisplay = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const address = orderData.shippingAddress || {};
  const addressParts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
  ].filter(Boolean);
  const addressStr = addressParts.length > 0 ? addressParts.join(", ") : "Designated Delivery Facility";

  // Build items rows
  const itemsRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #1e293b; font-size: 13px;">
        <strong>${item.name || "Fire Safety Equipment"}</strong>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #64748b; font-size: 13px; text-align: center;">
        ${item.quantity || 1}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #0f172a; font-size: 13px; text-align: right; font-weight: bold;">
        ₹${((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
      </td>
    </tr>
  `,
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Order Has Shipped - Sri Udharchi Enterprises</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              
              <!-- Brand Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 28px 24px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                    SRI UDHARCHI ENTERPRISES
                  </h1>
                  <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    NBC 2016 &amp; IS Certified Industrial Fire Protection
                  </p>
                </td>
              </tr>

              <!-- Status Banner -->
              <tr>
                <td style="background-color: #eff6ff; border-bottom: 1px solid #dbeafe; padding: 20px 24px; text-align: center;">
                  <div style="display: inline-block; background-color: #2563eb; color: #ffffff; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; font-size: 22px; margin-bottom: 8px;">
                    🚚
                  </div>
                  <h2 style="margin: 0; color: #1e40af; font-size: 19px; font-weight: 800;">
                    Your Safety Order Has Shipped!
                  </h2>
                  <p style="margin: 6px 0 0 0; color: #3b82f6; font-size: 13px; font-weight: 600;">
                    Order Reference: #${orderNum}
                  </p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 28px 24px;">
                  <p style="margin: 0 0 16px 0; color: #334155; font-size: 14px; line-height: 1.6;">
                    Dear <strong>${customerName}</strong>,
                  </p>
                  <p style="margin: 0 0 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
                    Your certified industrial fire protection equipment has been rigorously tested, packed, and dispatched from our <strong>Palasamudram Central Logistics Hub</strong>. It is now in transit with our authorized carrier partner.
                  </p>

                  <!-- Tracking & Courier Highlight Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom: 12px;">
                              <span style="display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                Carrier Partner
                              </span>
                              <strong style="font-size: 16px; color: #0f172a;">
                                ${courier}
                              </strong>
                            </td>
                            <td align="right" style="padding-bottom: 12px;">
                              <span style="display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                Dispatched On
                              </span>
                              <span style="font-size: 13px; color: #334155; font-weight: 600;">
                                ${nowDisplay}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                              <span style="display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                Airway Bill / Consignment Number (AWB)
                              </span>
                              <div style="background-color: #ffffff; border: 1px solid #94a3b8; border-radius: 8px; padding: 10px 14px; display: inline-block;">
                                <span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #1e3a5f; letter-spacing: 1px;">
                                  ${awb}
                                </span>
                              </div>
                            </td>
                          </tr>
                          ${
                            dispatchNote
                              ? `
                          <tr>
                            <td colspan="2" style="padding-top: 12px;">
                              <p style="margin: 0; font-size: 12px; color: #475569; font-style: italic;">
                                <strong>Dispatch Routing Note:</strong> ${dispatchNote}
                              </p>
                            </td>
                          </tr>
                          `
                              : ""
                          }
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Primary CTA Button -->
                  <div style="text-align: center; margin: 28px 0 24px 0;">
                    <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 10px rgba(37,99,235,0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                      Track Your Consignment Live →
                    </a>
                  </div>

                  <!-- Delivery Address Card -->
                  <div style="background-color: #f1f5f9; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                    <span style="display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
                      Delivery Facility
                    </span>
                    <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.5;">
                      <strong>${customerName}</strong><br>
                      ${addressStr}<br>
                      ${orderData.customerPhone ? `Contact Phone: ${orderData.customerPhone}` : ""}
                    </p>
                  </div>

                  <!-- Ordered Items Summary Table -->
                  ${
                    items.length > 0
                      ? `
                  <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                    Shipment Items (${items.length})
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
                    <thead>
                      <tr style="background-color: #f8fafc;">
                        <th align="left" style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #64748b;">Item</th>
                        <th align="center" style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #64748b;">Qty</th>
                        <th align="right" style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #64748b;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsRows}
                      <tr style="background-color: #f8fafc;">
                        <td colspan="2" style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #334155; text-align: right;">
                          Total Invoiced:
                        </td>
                        <td style="padding: 10px 12px; font-size: 13px; font-weight: 900; color: #0f172a; text-align: right;">
                          ₹${(orderData.total || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  `
                      : ""
                  }

                  <!-- Statutory Compliance Guarantee -->
                  <div style="border-left: 3px solid #e11d48; padding-left: 12px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
                      <strong>Statutory Certification Guarantee:</strong> All equipment is supplied strictly under NBC 2016 Part 4 &amp; IS 15683 manufacturing standards, accompanied by factory test certificates and hydraulic pressure tags.
                    </p>
                  </div>

                  <!-- Support Helpline -->
                  <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;">
                    Have questions about your delivery or on-site commissioning? Call our 24/7 Logistics Dispatch Desk at <a href="tel:+918639858221" style="color: #2563eb; text-decoration: none; font-weight: bold;">+91 8639858221</a> or email <a href="mailto:sriudharchienterprises@gmail.com" style="color: #2563eb; text-decoration: none;">sriudharchienterprises@gmail.com</a>.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0f172a; padding: 20px 24px; text-align: center;">
                  <p style="margin: 0 0 6px 0; color: #f8fafc; font-size: 12px; font-weight: bold;">
                    Sri Udharchi Enterprises
                  </p>
                  <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px;">
                    Proprietor: <strong>Dabbara Bhanu Swaroop</strong>
                  </p>
                  <p style="margin: 0; color: #64748b; font-size: 10px; line-height: 1.4;">
                    Central Office &amp; Logistics Depot: H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const senderEmail = (contactInfo && contactInfo.supportEmail) || "sriudharchienterprises@gmail.com";
      await transporter.sendMail({
        from: `"Sri Udharchi Logistics" <${senderEmail}>`,
        to: recipientEmail,
        subject: `Your Safety Order #${orderNum} Has Shipped via ${courier} (AWB: ${awb})`,
        html: emailHtml,
      });

      console.log(`[Order Dispatch] Successfully sent shipping email for Order #${orderNum} to ${recipientEmail}`);

      // Also send administrative copy
      try {
        await transporter.sendMail({
          from: `"Sri Udharchi Dispatch Bot" <${senderEmail}>`,
          to: contactInfo.adminEmail || "bhanuswaroop04@gmail.com",
          subject: `[Admin Alert] Order #${orderNum} Dispatched to ${customerName} (${courier})`,
          text: `Order #${orderNum} marked shipped.\nCustomer: ${customerName} (${recipientEmail})\nCourier: ${courier}\nAWB: ${awb}\nTracking URL: ${trackingUrl}`,
        });
      } catch (adminErr) {
        console.warn("[Order Dispatch] Admin notification copy failed:", adminErr.message);
      }

      // Mark email as sent in Firestore
      try {
        await db.collection("orders").doc(orderId).update({
          shippingEmailSent: true,
          shippingEmailSentAt: new Date().toISOString(),
        });
      } catch (e) {}

      return { sent: true, recipient: recipientEmail };
    } catch (mailErr) {
      console.error(`[Order Dispatch] Failed sending shipping email for Order #${orderNum}:`, mailErr.message);
      return { sent: false, error: mailErr.message };
    }
  } else {
    console.warn(`[Order Dispatch] Email transporter not available. Please configure SMTP credentials.`);
    return { sent: false, error: "SMTP transporter not configured" };
  }
}

/**
 * Firestore Trigger: Automatically send Shipping Confirmation Email when order status changes to "shipped"
 */
exports.onOrderStatusUpdated = onDocumentUpdated(
  {
    document: "orders/{orderId}",
    secrets: [smtpPass],
  },
  async (event) => {
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();
    if (!beforeData || !afterData) return;

    const wasShipped = beforeData.status === "shipped" || beforeData.status === "dispatched";
    const isShipped = afterData.status === "shipped" || afterData.status === "dispatched";

    if (!wasShipped && isShipped) {
      console.log(
        `[Order Dispatch] Order #${afterData.orderNumber || event.params.orderId} status changed to SHIPPED. Triggering customer email...`,
      );
      await sendShippingEmail(afterData, event.params.orderId);
    }
  },
);

/**
 * HTTP Endpoint: Send or re-send Order Shipping Notification Email on-demand
 */
exports.sendOrderShippingEmailManual = onRequest(
  {
    cors: true,
    secrets: [smtpPass],
  },
  async (req, res) => {
    try {
      const { orderId, orderNumber } = req.body || req.query || {};
      const targetId = orderId || orderNumber;
      if (!targetId) {
        res.status(400).json({ success: false, error: "Missing orderId or orderNumber parameter" });
        return;
      }

      const docSnap = await db.collection("orders").doc(targetId).get();
      let orderData = null;
      let finalDocId = targetId;
      if (docSnap.exists) {
        orderData = docSnap.data();
      } else {
        const qSnap = await db.collection("orders").where("orderNumber", "==", targetId).limit(1).get();
        if (!qSnap.empty) {
          orderData = qSnap.docs[0].data();
          finalDocId = qSnap.docs[0].id;
        }
      }

      if (!orderData) {
        res.status(404).json({ success: false, error: `Order #${targetId} was not found` });
        return;
      }

      const result = await sendShippingEmail(orderData, finalDocId);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error("[Order Dispatch] Error in sendOrderShippingEmailManual:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

