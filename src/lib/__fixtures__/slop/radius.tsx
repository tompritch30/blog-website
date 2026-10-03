export default function Planted() {
  return (
    <div>
      <div className="rounded-lg border p-4">Box</div>
      <span className="rounded-full px-2">Pill</span>
      <div className="rounded-sm">Small corners are fine</div>
      <div style={{ borderRadius: 12 }}>Inline</div>
      <div className="rounded-[2px] sm:rounded-[10px]">Arbitrary</div>
    </div>
  );
}
