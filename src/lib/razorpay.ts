/**
 * Sri Udharchi Enterprises - Razorpay Payment Gateway Integration
 * Handles safe client checkout, script injection, success/failure handling, and audit logging.
 */

import { recordPaymentLog } from "./db-service";
import type { PaymentLogItem } from "./types";

export const RAZORPAY_KEY_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_RAZORPAY_KEY_ID"]) ||
  "rzp_test_TsSdQPZMXEYn5z";

export interface RazorpaySuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id?: string | undefined;
  razorpay_signature?: string | undefined;
}

export interface RazorpayFailurePayload {
  code: string;
  description: string;
  source?: string | undefined;
  step?: string | undefined;
  reason?: string | undefined;
  metadata?: {
    order_id?: string | undefined;
    payment_id?: string | undefined;
  } | undefined;
}

export type RazorpayModalResult =
  | {
      status: "success";
      data: RazorpaySuccessPayload;
    }
  | {
      status: "failed";
      error: RazorpayFailurePayload;
    }
  | {
      status: "dismissed";
      message: string;
    };

export interface LaunchRazorpayOptions {
  orderNumber: string;
  amount: number; // in INR rupees
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string | undefined;
  gstin?: string | undefined;
  address?: string | undefined;
  razorpayOrderId?: string | undefined; // optional server-generated order id
}

/**
 * Dynamically injects and waits for Razorpay checkout.js script.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK from CDN");
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Safely launches the Razorpay Checkout Modal.
 * Notes every success, failure, and dismissal into Firestore payment_logs.
 */
export async function launchRazorpayCheckout(
  opts: LaunchRazorpayOptions,
): Promise<RazorpayModalResult> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error(
      "Unable to connect to the secure Razorpay payment gateway. Please check your internet connection or choose Cash on Delivery.",
    );
  }

  const amountInPaise = Math.round(opts.amount * 100);

  // 1. Audit log: initiated
  await recordPaymentLog({
    orderId: opts.orderNumber,
    orderNumber: opts.orderNumber,
    amount: opts.amount,
    currency: "INR",
    gateway: "razorpay",
    status: "initiated",
    customerName: opts.customerName,
    customerEmail: opts.customerEmail,
    customerPhone: opts.customerPhone,
    createdAt: new Date().toISOString(),
  }).catch((err) => {
    console.warn("Notice: could not record initial payment log:", err);
  });

  return new Promise<RazorpayModalResult>((resolve) => {
    let resolved = false;

    // Razorpay standard checkout configuration
    const options: Record<string, unknown> = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
      name: "Sri Udharchi Enterprises",
      description: `Industrial Safety Equipment Booking #${opts.orderNumber}`,
      image: "https://udharchi.in/favicon.ico",
      prefill: {
        name: opts.customerName,
        email: opts.customerEmail,
        contact: opts.customerPhone.replace(/\D/g, "").slice(-10),
      },
      notes: {
        orderNumber: opts.orderNumber,
        companyName: opts.companyName || "",
        gstin: opts.gstin || "",
        deliveryAddress: opts.address || "",
      },
      theme: {
        color: "#ea580c", // Brand orange/flame theme
        backdrop_color: "rgba(15, 23, 42, 0.75)",
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          if (!resolved) {
            resolved = true;
            // Audit log: dismissed
            recordPaymentLog({
              orderId: opts.orderNumber,
              orderNumber: opts.orderNumber,
              amount: opts.amount,
              currency: "INR",
              gateway: "razorpay",
              status: "dismissed",
              customerName: opts.customerName,
              customerEmail: opts.customerEmail,
              customerPhone: opts.customerPhone,
              createdAt: new Date().toISOString(),
            }).catch(() => {});

            resolve({
              status: "dismissed",
              message:
                "Payment was not completed because the checkout modal was closed. You can retry with Razorpay or choose Cash on Delivery.",
            });
          }
        },
      },
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
      }) => {
        if (!resolved) {
          resolved = true;
          // Audit log: success
          recordPaymentLog({
            orderId: opts.orderNumber,
            orderNumber: opts.orderNumber,
            amount: opts.amount,
            currency: "INR",
            gateway: "razorpay",
            status: "success",
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            customerName: opts.customerName,
            customerEmail: opts.customerEmail,
            customerPhone: opts.customerPhone,
            createdAt: new Date().toISOString(),
          }).catch(() => {});

          resolve({
            status: "success",
            data: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || undefined,
              razorpay_signature: response.razorpay_signature || undefined,
            },
          });
        }
      },
    };

    if (opts.razorpayOrderId) {
      options["order_id"] = opts.razorpayOrderId;
    }

    try {
      // Instantiate Razorpay window constructor
      const RazorpayConstructor = (
        window as unknown as {
          Razorpay: new (opts: Record<string, unknown>) => {
            open: () => void;
            on: (
              event: string,
              cb: (response: { error: RazorpayFailurePayload }) => void,
            ) => void;
          };
        }
      ).Razorpay;

      const rzpInstance = new RazorpayConstructor(options);

      // Listen for payment failure events
      rzpInstance.on(
        "payment.failed",
        (response: { error: RazorpayFailurePayload }) => {
          if (!resolved) {
            resolved = true;
            const err = response.error || {
              code: "PAYMENT_FAILED",
              description: "Transaction could not be completed by bank or card issuer.",
            };

            // Audit log: failed
            recordPaymentLog({
              orderId: opts.orderNumber,
              orderNumber: opts.orderNumber,
              amount: opts.amount,
              currency: "INR",
              gateway: "razorpay",
              status: "failed",
              paymentId: err.metadata?.payment_id || undefined,
              razorpayOrderId: err.metadata?.order_id || undefined,
              errorCode: err.code || "FAILED",
              errorDescription: err.description || "Payment failed",
              errorReason: err.reason || undefined,
              errorSource: err.source || undefined,
              errorStep: err.step || undefined,
              customerName: opts.customerName,
              customerEmail: opts.customerEmail,
              customerPhone: opts.customerPhone,
              createdAt: new Date().toISOString(),
            }).catch(() => {});

            resolve({
              status: "failed",
              error: err,
            });
          }
        },
      );

      rzpInstance.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!resolved) {
        resolved = true;
        resolve({
          status: "failed",
          error: {
            code: "INITIALIZATION_FAILED",
            description: `Could not launch Razorpay: ${msg}`,
          },
        });
      }
    }
  });
}
