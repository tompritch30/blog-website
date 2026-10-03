export default function Planted() {
  return (
    <section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card border p-4">One</div>
        <div className="card border p-4">Two</div>
        <div className="card border p-4">Three</div>
      </div>
      <div className="grid grid-cols-4">
        <div className="col-span-2 row-span-2">Big</div>
        <div className="col-span-1">Small</div>
      </div>
      <figure className="testimonial">
        <blockquote>Great to work with.</blockquote>
      </figure>
    </section>
  );
}
