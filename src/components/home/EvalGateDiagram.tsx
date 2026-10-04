// The release evaluation system from the "release-evals" case study, drawn from its facts only:
// synthetic client cases, agents drafting each report, rule checks and an LLM judge, and a gate
// that passes a release to production or fails it, stopping the regression before it reaches clients.
// The fail branch and its box are dashed, so the two outcomes differ by more than their labels.
// Two drawings of the same system: across for wide screens, down for phones, so the labels stay
// at their real size (14px) instead of shrinking with the width. CSS shows one at a time.

const LABEL =
  "Synthetic client cases go to the agents, which draft each report. Rule checks and an LLM judge score every draft. At the release gate, a pass goes to production release; a fail stops the regression before it reaches clients.";

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
    <svg className="diagram-wide" viewBox="0 -22 740 194" role="img" aria-labelledby="eval-wide-title">
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

      <path className="dg-line dg-gate" d="M546,58 V122" />
      <text className="dg-text dg-strong" x={546} y={146} textAnchor="middle">
        Release gate
      </text>

      {/* Pass: on to production. */}
      <path className="dg-line" d="M546,90 H596" />
      <Head x={602} y={90} dir="right" />
      <text className="dg-text" x={572} y={83} textAnchor="middle">
        Pass
      </text>
      <rect className="dg-box" x={606} y={64} width={122} height={52} />
      <text className="dg-text" x={667} y={86} textAnchor="middle">
        Production
      </text>
      <text className="dg-text" x={667} y={104} textAnchor="middle">
        release
      </text>

      {/* Fail: dashed, up and away from production. */}
      <path className="dg-line dg-dash" d="M546,58 V8 H596" />
      <Head x={602} y={8} dir="right" />
      <text className="dg-text" x={554} y={40}>
        Fail
      </text>
      <rect className="dg-box dg-dash" x={606} y={-18} width={122} height={52} />
      <text className="dg-text" x={667} y={4} textAnchor="middle">
        Regression
      </text>
      <text className="dg-text" x={667} y={22} textAnchor="middle">
        stopped
      </text>
    </svg>
  );
}

function Tall() {
  return (
    <svg className="diagram-tall" viewBox="0 0 320 446" role="img" aria-labelledby="eval-tall-title">
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

      <path className="dg-line dg-gate" d="M124,328 H196" />
      <text className="dg-text dg-strong" x={206} y={333}>
        Release gate
      </text>
      <path className="dg-line" d="M160,328 V344" />

      {/* Fail on the left, dashed; pass on the right, on to production. */}
      <path className="dg-line dg-dash" d="M160,344 H78 V372" />
      <Head x={78} y={378} dir="down" />
      <text className="dg-text" x={86} y={366}>
        Fail
      </text>
      <rect className="dg-box dg-dash" x={10} y={382} width={136} height={52} />
      <text className="dg-text" x={78} y={404} textAnchor="middle">
        Regression
      </text>
      <text className="dg-text" x={78} y={422} textAnchor="middle">
        stopped
      </text>

      <path className="dg-line" d="M160,344 H242 V372" />
      <Head x={242} y={378} dir="down" />
      <text className="dg-text" x={250} y={366}>
        Pass
      </text>
      <rect className="dg-box" x={174} y={382} width={136} height={52} />
      <text className="dg-text" x={242} y={404} textAnchor="middle">
        Production
      </text>
      <text className="dg-text" x={242} y={422} textAnchor="middle">
        release
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
