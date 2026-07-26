interface RulesSectionProps {
  rules: string[]
}

export function RulesSection({ rules }: RulesSectionProps) {
  return (
    <section className="mt-3 border border-border-light bg-white p-3 text-sm print:mt-2 print:border-zinc-800 print:break-inside-avoid">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 print:text-black">
        Rules and Regulations
      </h3>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-zinc-800 print:text-black">
        {rules.map((rule, index) => (
          <li key={`${index}-${rule.slice(0, 12)}`}>{rule}</li>
        ))}
      </ol>
    </section>
  )
}
