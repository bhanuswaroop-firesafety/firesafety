/**
 * Sri Udharchi Enterprises - Cloud Functions (v2)
 * Task E: Daily Scheduled Equipment Refill & AMC Maintenance Alerts
 * Timezone: Asia/Kolkata (+05:30)
 * Uses firebase-functions v5/v6 with params & defineSecret
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Define Secrets and Environment Parameters
const smtpPass = defineSecret("SMTP_PASS");
const smtpUser = defineString("SMTP_USER", { default: "support@udharchi.in" });
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
 * Setup Email Transport using defineSecret and defineString
 */
function getEmailTransporter() {
  try {
    const user = smtpUser.value();
    const pass = smtpPass.value();
    if (user && pass) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    }
  } catch (err) {
    console.warn("[Task E] Email transport not configured or secret missing:", err.message);
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
        supportEmail: data.supportEmail || "support@udharchi.in",
        adminEmail: data.adminEmail || adminEmail.value(),
      };
    }
  } catch (e) {
    console.warn("[Task E] Could not fetch settings/contact, using defaults:", e.message);
  }
  return {
    supportPhone: "+91 8639858221",
    supportEmail: "support@udharchi.in",
    adminEmail: adminEmail.value(),
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
  const transporter = getEmailTransporter();
  const contactInfo = await getLiveContactSettings();
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
                <p style="font-size: 11px; color: #888;">Sri Udharchi Enterprises (Proprietor: Dabbara Bhanu Swaroop) • Registered Office: 4-169-B, Dharmapuram, Peddapappur, Dharmapuram, Ananthapuramu, Andhra Pradesh, 515445, India • Office &amp; Depot: H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241</p>
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

