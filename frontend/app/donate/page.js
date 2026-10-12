import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import DonationPortal from "@/components/DonationPortal";

export const metadata = {
  title: "Donate | Shiv Gorakh Welfare Foundation",
  description:
    "Support Shiv Gorakh Welfare Foundation with verified UPI QR code, bank transfer, and instant donation verification.",
};

export default async function DonationPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const initialAmount = resolvedParams?.amount || "";
  return (
    <main>
      {/* Hero Header */}
      {/* <section className="bg-brand-cream p-6 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
              Give with confidence
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight tracking-tight text-stone-900 sm:text-7xl">
              Help care reach
              <br />
              <span className="italic text-brand-orange">further.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-stone-600">
              Your generosity helps our foundation rescue vulnerable animals, provide emergency
              medical care, and support our community feeding drives. Every contribution is verified
              and directly connected to impact.
            </p>
          </div>
          <div className="relative h-80 overflow-hidden rounded-3xl bg-orange-100 shadow-xl sm:h-100">
            <Image
              className="object-cover"
              src="/services/4.jpeg"
              alt="Community members working together outdoors"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section> */}

      {/* Interactive Donation Portal Component */}
      <section className="bg-gradient-to-b from-brand-cream to-white px-6 py-14 sm:px-10 lg:px-16">
        <Suspense fallback={<div className="text-center py-12 text-sm text-stone-500">Loading donation portal...</div>}>
          <DonationPortal initialAmount={initialAmount} />
        </Suspense>
      </section>

      {/* Trust & Foundation Verification Info */}
      <section className="border-t border-orange-100 bg-white px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
              Verified Foundation Integrity
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-stone-900">
              Transparent, Direct Contributions
            </h2>
            <p className="mt-4 rounded-br-full rounded-tr-full border-l-2 border-brand-orange bg-orange-50/70 p-5 text-sm leading-7 text-stone-700">
              All contributions go directly into the official bank account of Shiv Gorakh Welfare
              Foundation. After making a payment via UPI or Net Banking, upload your transaction
              screenshot with the 12-digit UTR/reference number for admin verification.
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-orange hover:text-orange-800"
              href="/certificates"
            >
              <span>Review available foundation registration & certificates</span>
            </Link>
          </div>
          <aside className="rounded-bl-full rounded-br-full border border-orange-100 bg-brand-cream/70 p-7">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Need assistance or receipt?
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Have questions regarding 80G tax exemption receipts, large donations, or corporate CSR
              support? Connect directly with our team.
            </p>
            <a
              className="mt-5 block font-semibold text-brand-orange hover:underline"
              href="mailto:info@shivgorakh.org.in"
            >
              info@shivgorakh.org.in
            </a>
            <a
              className="mt-2 block text-sm font-semibold text-stone-700 hover:text-brand-orange"
              href="tel:+919336950578"
            >
              +91 93369 50578
            </a>
            <p className="mt-5 border-t border-stone-200/60 pt-4 text-xs leading-5 text-stone-500">
              Mohammad Pur Jadied, Keorar, Milak, Rampur, Uttar Pradesh 244701
            </p>
          </aside>
        </div>
      </section>

      {/* Volunteer CTA */}
      {/* <section className="bg-brand-green px-6 py-12 text-center text-white">
        <h2 className="font-serif text-3xl font-bold">Want to help on the ground?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-white/80">
          Join our volunteer network to help feed, rescue, and care for animals in your local area.
        </p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-green transition hover:bg-orange-100"
          href="/volunteer/register"
        >
          Volunteer with us ↗
        </Link>
      </section> */}
    </main>
  );
}
