export const Card = ({title, children, badge}) => (
    <section className="rounded-2xl bg-surface border border-line p-5 shadow-soft">
      <div className="flex items-center justify-between">
        {title && <h3 className="font-semibold">{title}</h3>}
        {badge && <span className="text-xs rounded-full bg-pastel-lemon px-2.5 py-1"> {badge} </span>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
  
  export const Button = ({children, variant="primary", ...props}) => {
    const base = "inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 font-semibold shadow-soft hover:shadow-floaty active:scale-[0.99] focus:outline-none focus:ring-4";
    const styles = {
      primary: `${base} bg-brand-primary text-white focus:ring-brand-primarySoft`,
      soft:    `${base} bg-pastel-violet text-ink`,
      ghost:   `${base} bg-white border border-line text-ink`,
    };
    return <button className={styles[variant]} {...props}>{children}</button>;
  };
  
  export const Input = (props) => (
    <input
      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-primarySoft"
      {...props}
    />
  );
  
  // chip radios for whole site
  export const RadioPill = ({name, label}) => {
    const id = `${name}-${label.replace(/\s+/g,'').toLowerCase()}`;
    return (
      <label htmlFor={id}
        className="cursor-pointer select-none rounded-full border border-line bg-pastel-sky/60 px-4 py-2 text-sm hover:bg-white hover:shadow-soft transition
                   has-[:checked]:bg-pastel-lilac has-[:checked]:border-brand-primary has-[:checked]:text-ink">
        <input id={id} type="radio" name={name} value={label} className="sr-only" />
        {label}
      </label>
    );
  };
  