export default function WorkspacePage({ title, description }) {
  return (
    <main className="px-4 py-8 sm:px-7 lg:px-9">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        {title} workspace
      </section>
    </main>
  );
}
