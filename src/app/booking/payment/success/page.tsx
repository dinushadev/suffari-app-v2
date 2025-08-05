"use client";
import React from "react";
import { Button } from "../../../../components/atoms";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, ShieldCheckIcon, PhoneIcon, CalendarIcon, MapPinIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function PaymentSuccessPage() {
  const router = useRouter();
  // Demo data, replace with real data as needed
  const bookingId = "RAAHI-62347452";
  const contactWithin = "24 minutes";
  const email = "ffdd@ddd.v";
  const location = "Bandhavgarh National Park, Madhya Pradesh";
  const dateTime = "8/21/2025 • evening";
  const contactName = "hghh";
  const vehicle = "Standard Safari Jeep";

  // Calculate estimated contact time: 30 minutes from now
  function getEstimatedContactTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  }
  const estimatedContact = getEstimatedContactTime();

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      <div className="w-full max-w-lg bg-ivory rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        <div className="p-8 flex flex-col items-center gap-6">
          {/* Booking Confirmed */}
          <div className="flex flex-col items-center gap-2">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
            <div className="text-2xl font-bold text-green-700">Booking Confirmed!</div>
            <div className="text-base text-orange font-medium">Booking ID: <span className="font-mono">{bookingId}</span></div>
            <div className="text-center mt-2">Your booking is confirmed & locked in our system<br/>We've successfully reserved your safari experience. Our local partner will contact you shortly to finalize the details and confirm your adventure.</div>
          </div>

          {/* Expected Host Contact */}
          <div className="w-full bg-green-50 rounded-xl p-4 flex flex-col gap-1 border border-green-100">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <PhoneIcon className="h-5 w-5" /> Expected Host Contact
            </div>
            <div className="text-sm text-gray-700">Estimated contact time: <span className="font-semibold">{estimatedContact}</span></div>
            <div className="text-sm text-gray-600">Your dedicated host will reach out within <span className="font-semibold">{contactWithin}</span> to confirm vehicle details and provide final instructions for your safari.</div>
          </div>

          {/* Email Confirmation Sent */}
          <div className="w-full bg-blue-50 rounded-xl p-4 flex flex-col gap-1 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 font-semibold">
              <EnvelopeIcon className="h-5 w-5" /> Email Confirmation Sent
            </div>
            <div className="text-sm text-gray-700">A detailed confirmation email has been sent to <span className="font-semibold">{email}</span> with your booking details and contact information.</div>
          </div>

          {/* Payment Protection */}
          <div className="w-full bg-yellow-50 rounded-xl p-4 flex flex-col gap-1 border border-yellow-100">
            <div className="flex items-center gap-2 text-yellow-700 font-semibold">
              <ShieldCheckIcon className="h-5 w-5" /> Payment Protection
            </div>
            <div className="text-sm text-gray-700">You won't be charged until you confirm the vehicle with your host. This ensures you're completely satisfied with your safari arrangement before any payment is processed.</div>
          </div>

          {/* Safari Details */}
          <div className="w-full bg-white rounded-xl p-4 flex flex-col gap-3 border border-gray-100">
            <div className="text-lg font-semibold text-gray-800 mb-1">Your Safari Details</div>
            <div className="flex items-center gap-2 text-gray-700"><MapPinIcon className="h-5 w-5" /> <span className="font-medium">Location:</span> {location}</div>
            <div className="flex items-center gap-2 text-gray-700"><CalendarIcon className="h-5 w-5" /> <span className="font-medium">Date & Time:</span> {dateTime}</div>
            <div className="flex items-center gap-2 text-gray-700"><PhoneIcon className="h-5 w-5" /> <span className="font-medium">Contact:</span> {contactName}</div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="inline-block">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 17.25V19a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 19v-1.75M6.75 17.25v-2.625c0-.621.504-1.125 1.125-1.125h7.25c.621 0 1.125.504 1.125 1.125v2.625M6.75 17.25h10.5M9 10.5V7.875A3.375 3.375 0 0112.375 4.5h.25A3.375 3.375 0 0116 7.875V10.5" />
                </svg>
              </span>
              <span className="font-medium">Vehicle:</span> {vehicle}
            </div>
          </div>

          {/* What Happens Next */}
          <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-2 border border-gray-100">
            <div className="text-lg font-semibold text-gray-800 mb-1">What Happens Next?</div>
            <ul className="list-disc pl-5 text-gray-700 text-sm flex flex-col gap-1">
              <li>Your local safari partner will contact you within {contactWithin}</li>
              <li>Confirm vehicle details and pickup arrangements</li>
              <li>Receive your confirmation code and driver details</li>
              <li>Complete payment only after vehicle confirmation</li>
              <li>Enjoy your responsible wildlife adventure!</li>
            </ul>
          </div>

          <Button className="mt-4 w-full" variant="primary" onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    </div>
  );
}