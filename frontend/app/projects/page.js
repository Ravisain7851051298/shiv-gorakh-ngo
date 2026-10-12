import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Community Projects | Shiv Gorakh Welfare Foundation", description: "Explore field photographs and ask Shiv Gorakh Welfare Foundation about its community work." };

const projects = [
    { src: "/services/9.jpeg", alt: "A volunteer working outdoors", title: "Showing up in the field" },
    { src: "/services/4.jpeg", alt: "Community volunteers working together", title: "Community members together" },
    { src: "/services/10.jpeg", alt: "A volunteer carrying out field work", title: "Hands-on local action" },
];

export default function ProjectsPage() {
    return (
        <main>
            <section className="bg-brand-cream px-6 py-16 sm:px-10 lg:px-16"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">Community project showcase</p><h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight text-stone-900 sm:text-7xl">Local action.<br /><span className="italic text-brand-orange">Shared with care.</span></h1><p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">These photographs offer a glimpse of foundation field activities. We are adding detailed project descriptions only when confirmed information is available.</p></div></section>
            <section className="px-6 py-14 sm:px-10 lg:px-16"><div className="mx-auto max-w-6xl"><div className="grid gap-5 md:grid-cols-3">{projects.map((project) => <article className="overflow-hidden border border-orange-100 bg-white" key={project.src}><div className="relative aspect-4/5"><Image className="object-cover" src={project.src} alt={project.alt} fill sizes="(max-width: 768px) 100vw, 33vw" /></div><div className="p-5"><h2 className="font-serif text-xl text-stone-900">{project.title}</h2><p className="mt-2 text-xs leading-5 text-stone-500">Field photograph supplied by the foundation.</p></div></article>)}</div><p className="mt-6 border-l-2 border-brand-orange bg-orange-50 p-5 text-sm leading-6 text-stone-600">We do not infer budgets, outcomes, dates, or beneficiary details from photographs. Contact the foundation for verified project information.</p></div></section>
            <section className="bg-brand-green px-6 py-12 text-center text-white"><h2 className="font-serif text-3xl">Want to learn more about our work?</h2><div className="mt-5 flex justify-center gap-5"><a className="text-sm font-bold text-orange-200" href="mailto:info@shivgorakh.org.in?subject=Project%20enquiry">Ask about projects ↗</a><Link className="text-sm font-bold" href="/gallery">View the gallery ↗</Link></div></section>
        </main>
    );
}
