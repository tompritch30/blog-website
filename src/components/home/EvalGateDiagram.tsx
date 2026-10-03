// The release evaluation system from the "release-evals" case study, drawn from its facts only:
// synthetic client cases, agents drafting each report, rule checks and an LLM judge, and a gate
// that lets a release through or stops a regression before it reaches clients.
// Two drawings of the same system: across for wide screens, down for phones, so the labels stay
// at their real size (14px) instead of shrinking with the width. CSS shows one at a time.

const LABEL =
  "Synthetic client cases go to the agents, which draft each report. Rule checks and an LLM judge score every draft. The release gate passes a release to production and stops a regression.";

// A small filled arrowhead with its tip at (x, y).
function Head({ x, y, dir }: { x: number; y: number; dir: "right" | "down" | "left" }) {
  const d =
    dir === "right"
      ? `M${x},${y} l-8,-4.5 v9 z`
      : dir === "left"
        ? `M${x},${y} l8,-4.5 v9 z`
        : `M${x},${y} l-4.5,-8 h9 z`;
  return <path className="dg-head" d={d} />;
}

function Sheets({ x, y }: { x: number; y: number }) {
  // Three client cases, one on top of the other; the front one shows lines of a record.
  return (
    <g>
      <rect className="dg-box" x={x - 12} y={y - 12} width={80} height={52} />
      <rect className="dg-box" x={x - 6} y={y - 6} width={80} height={52} />
      <rect className="dg-box" x={x} y={y} width={80} height={52} />
      <path className="dg-rule" d={`M${x + 10},${y + 13} h58 M${x + 10},${y + 23} h50 M${x + 10},${y + 33} h58 M${x + 10},${y + 43} h32`} />
    </g>
  );
}

function Wide() {
  return (
    <svg className="diagram-wide" viewBox="0 0 740 172" role="img" aria-labelledby="eval-wide-title">
      <title id="eval-wide-title">{LABEL}</title>
      <Sheets x={24} y={64} />
      <text className="dg-text" x={64} y={146} textAnchor="middle">
        Synthetic
      </text>
      <text className="dg-text" x={64} y={164} textAnchor="middle">
        client cases
      </text>

      <path className="dg-line" d="M112,90 H144" />
      <Head x={150} y={90} dir="right" />

      <rect className="dg-box" x={154} y={62} width={136} height={56} />
      <text className="dg-text" x={222} y={86} textAnchor="middle">
        Agents draft
      </text>
      <text className="dg-text" x={222} y={104} textAnchor="middle">
        each report
      </text>

      <path className="dg-line" d="M290,90 H308 M308,48 V132 M308,48 H322 M308,132 H322" />
      <Head x={328} y={48} dir="right" />
      <Head x={328} y={132} dir="right" />

      <rect className="dg-box" x={332} y={26} width={120} height={44} />
      <text className="dg-text" x={392} y={53} textAnchor="middle">
        Rule checks
      </text>
      <rect className="dg-box" x={332} y={110} width={120} height={44} />
      <text className="dg-text" x={392} y={137} textAnchor="middle">
        LLM judge
      </text>

      <path className="dg-line" d="M452,48 H470 M452,132 H470 M470,48 V132 M470,90 H534" />
      <Head x={540} y={90} dir="right" />

      {/* A regression turns away before the gate. */}
      <path className="dg-line" d="M496,90 V20 H580" />
      <Head x={586} y={20} dir="right" />
      <text className="dg-text dg-muted" x={594} y={25}>
        Regression stopped
      </text>

      <path className="dg-line" d="M546,90 H580" />
      <path className="dg-line dg-gate" d="M546,58 V122" />
      <Head x={586} y={90} dir="right" />
      <text className="dg-text dg-strong" x={546} y={146} textAnchor="middle">
        Release gate
      </text>
      <text className="dg-text" x={594} y={95}>
        Production
      </text>
      <text className="dg-text" x={594} y={113}>
        release
      </text>
    </svg>
  );
}

function Tall() {
  return (
    <svg className="diagram-tall" viewBox="0 0 320 404" role="img" aria-labelledby="eval-tall-title">
      <title id="eval-tall-title">{LABEL}</title>
      <Sheets x={112} y={20} />
      <text className="dg-text" x={206} y={42}>
        Synthetic
      </text>
      <text className="dg-text" x={206} y={60}>
        client cases
      </text>

      <path className="dg-line" d="M152,72 V104" />
      <Head x={152} y={110} dir="down" />

      <rect className="dg-box" x={84} y={114} width={136} height={56} />
      <text className="dg-text" x={152} y={138} textAnchor="middle">
        Agents draft
      </text>
      <text className="dg-text" x={152} y={156} textAnchor="middle">
        each report
      </text>

      <path className="dg-line" d="M152,170 V186 M80,186 H240 M80,186 V202 M240,186 V202" />
      <Head x={80} y={208} dir="down" />
      <Head x={240} y={208} dir="down" />

      <rect className="dg-box" x={20} y={212} width={120} height={44} />
      <text className="dg-text" x={80} y={239} textAnchor="middle">
        Rule checks
      </text>
      <rect className="dg-box" x={180} y={212} width={120} height={44} />
      <text className="dg-text" x={240} y={239} textAnchor="middle">
        LLM judge
      </text>

      <path className="dg-line" d="M80,256 V272 M240,256 V272 M80,272 H240 M160,272 V318" />
      <Head x={160} y={324} dir="down" />

      {/* A regression turns away before the gate. */}
      <path className="dg-line" d="M160,294 H116" />
      <Head x={110} y={294} dir="left" />
      <text className="dg-text dg-muted" x={102} y={290} textAnchor="end">
        Regression
      </text>
      <text className="dg-text dg-muted" x={102} y={308} textAnchor="end">
        stopped
      </text>

      <path className="dg-line dg-gate" d="M124,328 H196" />
      <text className="dg-text dg-strong" x={206} y={333}>
        Release gate
      </text>
      <path className="dg-line" d="M160,328 V362" />
      <Head x={160} y={368} dir="down" />
      <text className="dg-text" x={160} y={392} textAnchor="middle">
        Production release
      </text>
    </svg>
  );
}

export default function EvalGateDiagram() {
  return (
    <figure className="diagram">
      <Wide />
      <Tall />
    </figure>
  );
}
