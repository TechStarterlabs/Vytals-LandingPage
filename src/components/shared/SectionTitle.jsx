function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-100">{title}</h1>
      {subtitle ? <p className="mt-2 text-slate-300">{subtitle}</p> : null}
    </div>
  )
}

export default SectionTitle
