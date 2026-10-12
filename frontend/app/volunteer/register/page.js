import Image from "next/image";
import VolunteerRegistrationForm from "../../../components/VolunteerRegistrationForm";

export const metadata = {
  title: "Volunteer Registration | Shiv Gorakh Welfare Foundation",
  description: "Register your interest in volunteering with Shiv Gorakh Welfare Foundation in Rampur, Uttar Pradesh.",
};

export default function VolunteerRegistrationPage() {
  return (

    <main className="bg-brand-cream px-5 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid overflow-hidden border border-orange-100 bg-white shadow-xl shadow-stone-900/5 grid-cols-1 md:grid-cols-2">
          <aside className="relative min-h-85 overflow-hidden bg-brand-green p-8 text-white sm:p-10 lg:min-h-full lg:p-12">
            <Image className="object-cover opacity-20" src="/founders/AnkitPandey.jpeg" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" />
            <div className="relative z-10 flex h-full flex-col">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">Make a difference nearby</p>
              <h1 className="mt-5 font-serif text-5xl leading-tight tracking-tight sm:text-6xl">A little time.<br /><span className="italic text-orange-200">A lot of heart.</span></h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-green-50/85">Join the Shiv Gorakh Welfare Foundation volunteer community. Share what you care about and we will be in touch about ways to contribute.</p>
              <div className="mt-8 space-y-4 border-t border-white/20 pt-6 text-sm text-green-50/90">
                <p className="flex items-start gap-3"><span className="text-orange-200">✳</span><span>Bring your time, skills, and local knowledge.</span></p>
                <p className="flex items-start gap-3"><span className="text-orange-200">✳</span><span>Choose the welfare area that matters to you.</span></p>
                <p className="flex items-start gap-3"><span className="text-orange-200">✳</span><span>Connect with a community rooted in Rampur.</span></p>
              </div>
              <div className="mt-auto hidden pt-12 lg:block">
                <p className="font-serif text-lg italic text-orange-100">“Good things happen when we show up.”</p>
                <p className="mt-2 text-xs text-green-100/70">Shiv Gorakh Welfare Foundation</p>
              </div>
            </div>
          </aside>

          <section className="p-6 sm:p-10 lg:p-12" aria-labelledby="registration-title">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">Volunteer with us</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-900" id="registration-title">Let&apos;s get to know you.</h2>
            <p className="mb-8 mt-3 max-w-lg text-sm leading-6 text-stone-600">Fill out the form below to register your interest. Fields marked <span className="font-bold text-brand-orange">*</span> are required.</p>
            <VolunteerRegistrationForm />
          </section>
        </div>
        <p className="mt-5 text-center text-xs text-stone-500">Questions? <a className="font-semibold text-brand-orange hover:text-orange-800" href="mailto:info@shivgorakh.org.in">info@shivgorakh.org.in</a></p>
      </div>
    </main>
  );
}
