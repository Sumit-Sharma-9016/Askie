export function Section({ title, children, actions }) {
  return (
    <section className="w-full px-2 md:px-4">
      
      <div className="max-w-3xl mx-auto card p-6 space-y-4">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>

        {/* Body */}
        <div>{children}</div>
      </div>
    </section>
  );
}
