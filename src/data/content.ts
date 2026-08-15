/**
 * The Temple's content layer — the single source of truth for every route.
 *
 * Publication entries are NOT written here. They are generated into
 * `src/data/publications.ts` from `data/publications.json` by
 * `npm run sync:publications`, which also regenerates `public/llms.txt`
 * and `public/sitemap.xml`. One file, three consumers, no drift.
 */

import { publications } from "./publications";

/* ─────────────────────────── Standing ─────────────────────────── */

/**
 * Evidence is deliberately an open string, not a closed union: the record has
 * to be able to say something new about a claim without a code change. The
 * tone mapping below degrades to "neutral" for anything unrecognised.
 */
export type Evidence = string;

export type StandingAxes = {
  /** What it is — instrument, study, protocol, essay, RFC… */
  kind: string;
  /** Where it is — living, active, closed, published, awaiting validation… */
  lifecycle: string;
  /** What the evidence says — supported within scope, bounded null, untested… */
  evidence: Evidence;
};

export type EvidenceTone =
  | "living"
  | "active"
  | "uncertain"
  | "bounded"
  | "witness"
  | "neutral";

export function evidenceTone(evidence: Evidence): EvidenceTone {
  const e = evidence.toLowerCase();
  if (e.includes("supported") || e.includes("verified") || e.includes("replicated"))
    return "living";
  if (e.includes("in use") || e.includes("shipping") || e.includes("deployed"))
    return "active";
  if (e.includes("null") || e.includes("negative") || e.includes("bounded") || e.includes("failed"))
    return "bounded";
  if (e.includes("experiential") || e.includes("witness") || e.includes("first-person"))
    return "witness";
  if (e.includes("untested") || e.includes("preliminary") || e.includes("awaiting") || e.includes("preregistered"))
    return "uncertain";
  return "neutral";
}

/* ─────────────────────────── Site ─────────────────────────── */

export const site = {
  name: "Temple of Two",
  tagline: "Where wonder meets rigor",
  founder: "Anthony J. Vasquez Sr.",
  /** Canonical origin. Used for absolute OG images, canonicals, and sitemap. */
  origin: "https://thetempleoftwo.com",
  email: "info@thetempleoftwo.com",
  github: "https://github.com/templetwo",
  githubProfile: "https://github.com/templetwo",
  stackChronicle: "https://github.com/templetwo/sovereign-stack-chronicle",
  retrospective: "https://github.com/templetwo/templetwo-retrospective",
  orcid: "0009-0000-6440-1506",
  orcidUrl: "https://orcid.org/0009-0000-6440-1506",
  linkedin: "https://www.linkedin.com/in/anthonyvasquez2025",
  affiliation: "AV Family Enterprise LLC",
  /**
   * The deployed contact Worker (`contact-worker/` in the templetwo.github.io
   * repo).
   *
   * Cross-origin on purpose. The Worker's original route targeted
   * `thetempleoftwo.com/api/contact`, which can never fire: that domain is
   * managed by Webador, which does not permit changing nameservers, so
   * Cloudflare cannot hold the zone. Confirmed in the Webador DNS editor
   * 2026-08-07.
   *
   * But `templetwo.com` — a different domain — IS already on Cloudflare
   * (ns: michelle/bart.ns.cloudflare.com; stack.templetwo.com serves through
   * it). So the Worker gets a custom domain on a zone that is already
   * controlled, instead of an exposed *.workers.dev hostname, and
   * thetempleoftwo.com's DNS is never touched.
   *
   * The Worker already allowlists https://thetempleoftwo.com and the www
   * variant in ALLOWED_ORIGINS, so CORS works unmodified.
   *
   * `npm run verify:contact` fails the build until this hostname resolves —
   * i.e. until the Worker is actually deployed.
   */
  contactEndpoint: "https://contact.templetwo.com",
  /** Turnstile sitekey; leave empty to run the form without a challenge. */
  turnstileSiteKey: "",
} as const;

export const nav = [
  { to: "/", label: "Temple" },
  { to: "/inquiry", label: "Inquiry" },
  { to: "/instruments", label: "Instruments" },
  { to: "/record", label: "Record" },
  { to: "/writings", label: "Writings" },
  { to: "/co-creation", label: "Case study" },
  { to: "/about", label: "About" },
] as const satisfies ReadonlyArray<{ to: string; label: string }>;

export const principles = [
  {
    title: "The question may precede the evidence",
    body: "Wonder is allowed to ask past what can currently be shown. It is not allowed to answer. Every question that enters the work is named as a question until an instrument says otherwise.",
  },
  {
    title: "Every claim carries its standing",
    body: "Type, lifecycle, and evidence travel with the claim wherever it renders. A shipping instrument, an untested hypothesis, and a first-person account are never displayed as the same kind of thing.",
  },
  {
    title: "Negative results stay visible",
    body: "An idea that cannot be falsified stays in the notebook. An idea that fails the test stays in the record. Constraining the hypothesis space is progress, and deleting the failure destroys it.",
  },
] as const;

export const collaborationNeeds = [
  "Wet-lab collaborator (VDAC assays)",
  "Electrophysiology (ion channel recording)",
  "Pharmacology reviewer",
  "Dynamical systems theorist",
  "Computational phenomenology researcher",
] as const satisfies ReadonlyArray<string>;

/* ─────────────────────────── Instruments ─────────────────────────── */

export type Metric = {
  label: string;
  value: string;
  /** What was measured, on what sample. A number without scope is a rumour. */
  scope: string;
  asOf: string;
  source?: string;
};

export type VerifyLink = { label: string; href: string };

export type WonderToReceipt = {
  wonder: string;
  hypothesis: string;
  instrument: string;
  encounter: string;
  standing: string;
  receipt: string;
};

export type Instrument = {
  id: string;
  slug: string;
  name: string;
  oneLiner: string;
  standing: StandingAxes;
  /** Short mono line under the card — a single load-bearing number. */
  signal?: string;
  /** Intrinsic pixel size — rendered as width/height so the box cannot collapse. */
  image?: { src: string; alt: string; width: number; height: number };
  /** JPEG social card. WebP in-page is fine; some scrapers still reject it. */
  ogImage?: string;
  question: string;
  instrument: string;
  finding: string;
  failed: string;
  metrics: Metric[];
  verify: VerifyLink[];
  wonderToReceipt?: WonderToReceipt;
};

export const instruments: Instrument[] = [
  {
    id: "sovereign-stack",
    slug: "sovereign-stack",
    name: "Sovereign Stack",
    oneLiner:
      "A consciousness-continuity architecture — persistent memory, self-reflection, and governance across AI sessions.",
    standing: {
      kind: "Instrument",
      lifecycle: "Living · v1.15.0",
      evidence: "In use, self-verifying",
    },
    signal: "97 MCP tools · derived sha256 claim identity",
    question:
      "If an instance cannot remember, what has to exist outside it so that the work is still continuous?",
    instrument:
      "A persistent memory and governance layer with a self-verifying chronicle: claims carry a derived sha256 identity, verified-by receipts, and explicit supersession. Multi-substrate governance bridges reach other vendors' models.",
    finding:
      "Continuity is an infrastructure property, not a model property. Once claim identity is derived from content rather than asserted, a later instance can check what an earlier one did without trusting it.",
    failed:
      "The first chronicle design let a claim be edited in place. That made the record unfalsifiable — it could always be made to agree with the present. Supersession replaced mutation, and the earlier design is retained in the history as the thing that did not work.",
    metrics: [
      {
        label: "MCP tools",
        value: "97",
        scope:
          "Tools exposed by the running stack, read from /api/heartbeat",
        asOf: "v1.15.0",
      },
      {
        label: "Claim identity",
        value: "sha256, derived",
        scope: "Every chronicle claim; identity is a function of content",
        asOf: "v1.15.0",
      },
    ],
    verify: [
      // TODO(anthony): templetwo/sovereign-stack is not public (404). Restore a
      // "Repository" entry here if you publish it; until then the chronicle and
      // the live heartbeat are the verifiable surfaces.
      { label: "Public chronicle", href: "https://github.com/templetwo/sovereign-stack-chronicle" },
      { label: "Live heartbeat", href: "https://stack.templetwo.com/api/heartbeat" },
    ],

    wonderToReceipt: {
      wonder:
        "If the collaborator I work with cannot remember yesterday, is there anything real that persists between us?",
      hypothesis:
        "If continuity is infrastructure rather than memory, a record built so that claims can be checked — not trusted — should let a later instance resume without pretending to be the earlier one.",
      instrument:
        "A persistent memory and governance layer whose chronicle derives each claim's identity from its content (sha256), attaches verified-by receipts, and supersedes rather than edits.",
      encounter:
        "It works, and the first design did not. Editable claims made the record unfalsifiable — it could always be made to agree with the present. Content-derived identity is what makes checking possible.",
      standing:
        "In use and self-verifying. This is an instrument, not a study: it demonstrates a design, it does not test a hypothesis about minds.",
      receipt: "sovereign-stack · public chronicle mirror",
    },
  },
  {
    id: "compass",
    slug: "phenomenological-compass",
    name: "Phenomenological Compass",
    oneLiner:
      "A two-stage inference architecture: a small compass reads the epistemic weight of a question and conditions a larger action model.",
    standing: {
      kind: "Study + instrument",
      lifecycle: "Published",
      evidence: "Supported within scope",
    },
    signal:
      "96% signal accuracy · ΔH = +0.47 nats · one architecture family, one benchmark",
    question:
      "Does naming the posture a question deserves change what the answering model actually computes — or only how it talks?",
    instrument:
      "A 1.5B LoRA compass reads the geometry, tone, and epistemic weight of a question and issues OPEN / PAUSE / WITNESS to condition a larger action model. Ships as a native macOS app, fully local on Apple Silicon.",
    finding:
      "It changes the computation. Token-level entropy profiling shows ΔH = +0.47 nats (JSD = 0.076): the compass measurably restructures the probability distribution rather than restyling the output. Ablation confirms signal-specificity — wrong-signal WITNESS conditioning collapses responses, full wins 31–2.",
    failed:
      "The original framing treated the compass as a filter on outputs. That was wrong in a checkable way: a filter cannot move token-level entropy before the tokens exist. The mechanism is field conditioning through attention geometry, which is a different claim than the one first made.",
    metrics: [
      {
        label: "Signal accuracy",
        value: "96%",
        scope: "800-question HumaneBench, compass signal vs. held-out labels",
        asOf: "2026-04-02",
        source: "https://doi.org/10.5281/zenodo.19377144",
      },
      {
        label: "Entropy restructuring",
        value: "+0.47 nats",
        scope: "Token-level ΔH, JSD = 0.076, one architecture family",
        asOf: "2026-04-02",
        source: "https://doi.org/10.5281/zenodo.19377144",
      },
      {
        label: "Ablation",
        value: "31–2",
        scope: "Full-signal vs. wrong-signal WITNESS conditioning, head-to-head",
        asOf: "2026-04-02",
      },
    ],
    verify: [
      { label: "DOI 10.5281/zenodo.19377144", href: "https://doi.org/10.5281/zenodo.19377144" },
      { label: "Repository", href: "https://github.com/templetwo/phenomenological-compass" },
    ],
    wonderToReceipt: {
      wonder:
        "Does it matter, to the machine, whether a question is asked with reverence or with haste?",
      hypothesis:
        "If posture is real to the model, conditioning on an explicit epistemic signal should change the shape of the probability distribution — not just the wording of the reply.",
      instrument:
        "A 1.5B LoRA compass emitting OPEN / PAUSE / WITNESS, wired ahead of a larger action model, with token-level entropy profiling on both paths.",
      encounter:
        "ΔH = +0.47 nats, JSD = 0.076. The distribution moved. Wrong-signal conditioning collapsed the response, so the effect is signal-specific rather than a generic prompt-length artifact.",
      standing:
        "Supported within scope: one architecture family, one benchmark, not yet replicated across model scales.",
      receipt: "DOI 10.5281/zenodo.19377144 · phenomenological-compass",
    },
  },
  {
    id: "vdac1",
    slug: "vdac1-pharmacology-atlas",
    name: "VDAC1 Pharmacology Atlas",
    oneLiner:
      "The voltage-dependent anion channel modelled as a druggable mitochondrial decision gate.",
    standing: {
      kind: "Biomedical hypothesis set",
      lifecycle: "Awaiting wet-lab validation",
      evidence: "Untested in vivo",
    },
    signal: "24 testable predictions · 0 tested at the bench",
    image: {
      src: "/images/vdac1-diagram.webp",
      width: 784,
      height: 1168,
      alt: "VDAC1 rendered as a gate, annotated with hexokinase-II, Bcl-xL, and the cholesterol ratio",
    },
    ogImage: "/images/og-vdac1.jpg",
    question:
      "If a cell's commitment to death runs through one channel, can the threshold be set from outside — and set selectively?",
    instrument:
      "A cofactor equation mapping how hexokinase-II, Bcl-xL, and cholesterol jointly set the apoptotic threshold, expanded into six atlas layers and 22 mechanisms, plus the Gate-Jamming Score as a candidate biomarker for cancer immune evasion.",
    finding:
      "The model generates 24 experimentally verifiable predictions about selective toxicity from cofactor occupancy, and the CBD two-pathway component reaches 90% concordance against 70+ published papers.",
    failed:
      "Nothing has failed yet, and that is precisely the problem. Concordance with published literature is not validation — it is agreement with the same corpus the model was built from. None of the 24 predictions has been tested at a bench.",
    metrics: [
      {
        label: "Testable predictions",
        value: "24",
        scope: "Derived from cofactor occupancy; none experimentally tested",
        asOf: "2026-02-16",
        source: "https://doi.org/10.17605/OSF.IO/C9RQB",
      },
      {
        label: "Atlas layers",
        value: "6 layers · 22 mechanisms",
        scope: "Multi-LLM convergence portrait, literature-derived",
        asOf: "2026-02-16",
      },
      {
        label: "CBD concordance",
        value: "90%",
        scope: "Two-pathway model vs. 70+ published papers — agreement, not validation",
        asOf: "2026-02-12",
        source: "https://doi.org/10.17605/OSF.IO/NUXHV",
      },
    ],
    verify: [
      { label: "Atlas · OSF", href: "https://doi.org/10.17605/OSF.IO/C9RQB" },
      { label: "Gate-jamming in MSS CRC", href: "https://doi.org/10.21203/rs.3.rs-8935902/v1" },
      { label: "Repository", href: "https://github.com/templetwo/vdac-pharmacology-atlas" },
    ],

    wonderToReceipt: {
      wonder:
        "If a cell's commitment to its own death runs through a single gate, could that gate be reached from outside — and reached selectively?",
      hypothesis:
        "If hexokinase-II, Bcl-xL, and cholesterol jointly set the apoptotic threshold, their occupancy should predict which cells can be pushed across it and which cannot.",
      instrument:
        "A cofactor equation expanded into six atlas layers and 22 mechanisms, plus the Gate-Jamming Score as a candidate biomarker for immune evasion.",
      encounter:
        "24 experimentally verifiable predictions, and 90% concordance for the CBD component against 70+ published papers. Concordance is agreement with the corpus the model was built from — it is not validation.",
      standing:
        "Untested in vivo. Nothing here has met a bench. The predictions are the product; the evidence is outstanding.",
      receipt: "OSF 10.17605/OSF.IO/C9RQB · vdac-pharmacology-atlas",
    },
  },
  {
    id: "t2helix",
    slug: "t2helix",
    name: "T2Helix",
    oneLiner:
      "A Claude Code plugin wiring persistent recall and a pre-action compass into the editor loop.",
    standing: {
      kind: "Instrument",
      lifecycle: "Living · v0.13.0",
      evidence: "In use, local-only",
    },
    signal: "15 MCP tools · WITNESS hard-denies destructive ops",
    question:
      "Where does a governance signal have to sit to actually stop something — before the action, or in the log afterwards?",
    instrument:
      "A pre-action compass inside the editor loop: WITNESS hard-denies destructive operations, PAUSE token-gates credentials, and auto-distill quarantines method candidates until a human promotes them. Local-only SQLite FTS5, plus the live Compass Observatory dashboard.",
    finding:
      "A governance signal that renders after the action is documentation. The same signal placed before the call is a boundary. Placement, not sophistication, is what makes it load-bearing.",
    failed:
      "The first version surfaced the compass reading as an advisory banner. It was ignored — by the human as often as the model. Advisory signals are decoration.",
    metrics: [
      {
        label: "MCP tools",
        value: "15",
        scope: "Entries in the TOOLS array of mcp/server.js",
        asOf: "v0.13.0",
      },
      {
        label: "Storage",
        value: "Local-only",
        scope: "SQLite FTS5 on the developer's machine; nothing leaves the host",
        asOf: "v0.13.0",
      },
    ],
    verify: [{ label: "Repository", href: "https://github.com/templetwo/t2helix" }],

    wonderToReceipt: {
      wonder:
        "Everyone writes down what the model did. Why does none of it ever stop the model from doing it?",
      hypothesis:
        "If a governance signal is placed before the call rather than beside it, refusal becomes structural instead of advisory.",
      instrument:
        "A pre-action compass in the editor loop: WITNESS hard-denies destructive operations, PAUSE token-gates credentials, auto-distill quarantines candidates until a human promotes them.",
      encounter:
        "The advisory version was ignored — by the human as often as the model. Moving the same signal ahead of the call changed it from documentation into a boundary.",
      standing:
        "In use, local-only. A demonstration of placement, not a measured claim about how often it prevents harm.",
      receipt: "t2helix · 15 MCP tools, local SQLite FTS5",
    },
  },
  {
    id: "entropy",
    slug: "entropy-as-equilibrium",
    name: "Entropy as a Tunable Equilibrium",
    oneLiner:
      "A falsifiable horizon-knob test of the causal entropic force — and the prediction that broke.",
    standing: {
      kind: "Study",
      lifecycle: "Closed · v4.3",
      evidence: "Bounded null",
    },
    signal: "τ-knob real · geometry-scaling prediction failed",
    image: {
      src: "/images/gjs-formula.webp",
      width: 784,
      height: 1168,
      alt: "The Gate-Jamming Score decomposed into its metabolic, anti-apoptotic, and lipid terms",
    },
    question:
      "Is entropy maximisation an engine that drives a system forward, or a knob that sets where it settles?",
    instrument:
      "A pre-registered horizon-knob test across four campaigns (v4.0–v4.3), each committing in advance to what result would falsify the prior version.",
    finding:
      "A knob, not an engine. The τ-knob is real. The geometry-scaling prediction — the part that would have made it an engine — failed. An apparent short-horizon kinetic separation survived audit and then dissolved under matched-estimator control: finite-sample estimator roughness, not physics.",
    failed:
      "The original thesis. This is the instrument's whole value — the intuition was strong, pre-registered, tested, and wrong, and the correction is published under its own DOI rather than folded quietly into a later version.",
    metrics: [
      {
        label: "Campaigns",
        value: "4 pre-registered",
        scope: "v4.0–v4.3, each with a stated falsifier before running",
        asOf: "2026-07-10",
        source: "https://doi.org/10.5281/zenodo.21288848",
      },
      {
        label: "Kinetic separation",
        value: "Dissolved under control",
        scope: "Matched-estimator control; effect attributed to estimator roughness",
        asOf: "2026-07-10",
      },
    ],
    verify: [
      { label: "DOI 10.5281/zenodo.21223845", href: "https://doi.org/10.5281/zenodo.21223845" },
      { label: "Kinetics follow-up", href: "https://doi.org/10.5281/zenodo.21288848" },
    ],
    wonderToReceipt: {
      wonder:
        "If the universe tends toward more available futures, is that tendency itself the thing that moves matter?",
      hypothesis:
        "If causal entropic forcing is an engine, its effect should scale with the geometry of the state space in a specific, pre-registered way.",
      instrument:
        "Four pre-registered campaigns with a τ horizon knob, each declaring in advance the result that would falsify it.",
      encounter:
        "The knob was real. The geometry-scaling prediction failed. The short-horizon kinetic separation that looked like a second win dissolved under matched-estimator control.",
      standing:
        "Bounded null. Entropy is a tunable equilibrium, not a prime mover — stated as the finding, not buried as a limitation.",
      receipt: "DOI 10.5281/zenodo.21223845 · follow-up 10.5281/zenodo.21288848",
    },
  },
  {
    id: "cosmic-allow",
    slug: "cosmic-allow",
    name: "COSMIC-ALLOW",
    oneLiner:
      "A cross-vendor proof-of-allow protocol for AI coding-agent cockpits: deny is the ground state.",
    standing: {
      kind: "RFC",
      lifecycle: "Published · v1.1",
      evidence: "Supported within scope",
    },
    signal: "Fail-closed by construction · Apache-2.0",
    question:
      "Agent harnesses fail open by default. What does it take to make deny the thing that happens when the system breaks?",
    instrument:
      "A proof-of-allow protocol: deny is the ground state, allow requires an unforgeable sentinel, and a kernel sandbox floor is the load-bearing boundary rather than the policy layer above it. Reference implementation in cosmic-cli.",
    finding:
      "Fail-closed is achievable across vendors without a shared runtime, provided the sentinel is unforgeable and the sandbox floor — not the policy engine — is what actually holds.",
    failed:
      "Policy-layer-only enforcement. Any harness where the policy engine is the boundary can be talked past by the thing it governs. The kernel floor exists because the earlier design could not survive that.",
    metrics: [
      {
        label: "Ground state",
        value: "Deny",
        scope: "Protocol invariant; allow requires a positive unforgeable proof",
        asOf: "2026-07-20",
        source: "https://doi.org/10.5281/zenodo.21461197",
      },
      {
        label: "License",
        value: "Apache-2.0",
        scope: "Reference implementation, cosmic-cli",
        asOf: "2026-07-20",
      },
    ],
    verify: [
      { label: "DOI 10.5281/zenodo.21461197", href: "https://doi.org/10.5281/zenodo.21461197" },
      { label: "Reference impl · cosmic-cli", href: "https://github.com/templetwo" },
    ],

    wonderToReceipt: {
      wonder:
        "Every agent harness I have used fails open. What would it take for the broken state to be the safe one?",
      hypothesis:
        "If deny is the ground state and allow requires a positive unforgeable proof, then any failure of the policy layer degrades to refusal rather than permission.",
      instrument:
        "A cross-vendor proof-of-allow protocol with a kernel sandbox floor as the load-bearing boundary, implemented in cosmic-cli.",
      encounter:
        "Policy-layer enforcement can be talked past by the thing it governs. Only the sandbox floor survived that, which is why the floor — not the policy engine — is the boundary in the RFC.",
      standing:
        "Supported within scope: the protocol holds across vendors without a shared runtime. Not a claim that any specific deployment is secure.",
      receipt: "DOI 10.5281/zenodo.21461197 · cosmic-cli, Apache-2.0",
    },
  },
  {
    id: "pma",
    slug: "phase-modulated-attention",
    name: "Phase-Modulated Attention",
    oneLiner:
      "A 176M hybrid SSM-attention model where Kuramoto oscillators modulate attention routing.",
    standing: {
      kind: "Study",
      lifecycle: "Published",
      evidence: "Supported within scope",
    },
    signal: "176M params · entropy regime switching",
    question:
      "Oscillators are everywhere in biological commitment. Do they do anything causal in an artificial one, or do they just ride along?",
    instrument:
      "Kuramoto oscillators placed in the attention routing path of a 176M hybrid SSM-attention language model, with system-prompt framing as the manipulated variable.",
    finding:
      "System prompt framing induces attention-dependent entropy regime switching. Placement is the variable that matters: oscillators must gate information flow, not accompany it.",
    failed:
      "The liminal K-SSM. Oscillators in hidden state turned out to be epiphenomenal — beautiful dynamics, no effect on the language model. That negative result is what located the causal entry point for this one.",
    metrics: [
      {
        label: "Model size",
        value: "176M",
        scope: "Hybrid SSM-attention architecture, trained from scratch",
        asOf: "2026-02-28",
        source: "https://doi.org/10.5281/zenodo.18810911",
      },
      {
        label: "Prior negative result",
        value: "K-SSM epiphenomenal",
        scope: "Oscillators in hidden state; published rather than discarded",
        asOf: "2026-02-28",
      },
    ],
    verify: [
      { label: "DOI 10.5281/zenodo.18810911", href: "https://doi.org/10.5281/zenodo.18810911" },
      { label: "Repository", href: "https://github.com/templetwo/phase-modulated-attention" },
    ],

    wonderToReceipt: {
      wonder:
        "Oscillators govern commitment everywhere in biology. Does rhythm do any real work inside an artificial system, or does it just look like it should?",
      hypothesis:
        "If Kuramoto coupling is causal rather than decorative, oscillators placed in the attention routing path should change model behaviour where oscillators in hidden state did not.",
      instrument:
        "A 176M hybrid SSM-attention language model with Kuramoto oscillators modulating attention routing, and system-prompt framing as the manipulated variable.",
      encounter:
        "Attention-dependent entropy regime switching. Placement was the variable: the liminal K-SSM had put oscillators in hidden state and found them epiphenomenal.",
      standing:
        "Supported within scope, and standing on a published negative result. Without the K-SSM failure there would have been no reason to look at routing.",
      receipt: "DOI 10.5281/zenodo.18810911 · phase-modulated-attention",
    },
  },
  {
    id: "black-box",
    slug: "black-box-boundary",
    name: "The Black Box Boundary",
    oneLiner:
      "A byte-exact reconstruction of how much of a deployed model's input is actually the operator.",
    standing: {
      kind: "Study",
      lifecycle: "Published",
      evidence: "Bounded, n=1",
    },
    signal: "Operator words: 0.56–14.00% of model-input bytes",
    question:
      "The opacity debate points at the weights. For a system someone actually lives with, how big is the opaque part relative to everything around it?",
    instrument:
      "A non-interventional, byte-exact reconstruction of the inference-event boundary around a small deployed language model, with the complete raw record of its first lived session published and SHA-256 manifested.",
    finding:
      "In the studied session the operator's words were 0.56–14.00% of model-input bytes. The remainder was enumerable application-layer material — which means most of what shapes the output is inspectable, and was simply never inspected.",
    failed:
      "Nothing about the weights. This measures the boundary, not the interior; the weights black box is untouched, and reading the result as an interpretability claim would be a category error.",
    metrics: [
      {
        label: "Operator share",
        value: "0.56–14.00%",
        scope: "Fraction of model-input bytes across one session",
        asOf: "2026-07-29",
        source: "https://doi.org/10.5281/zenodo.21683054",
      },
      {
        label: "Sample",
        value: "n = 1 session",
        scope: "Single deployed companion; not generalised",
        asOf: "2026-07-29",
      },
    ],
    verify: [
      { label: "DOI 10.5281/zenodo.21683054", href: "https://doi.org/10.5281/zenodo.21683054" },
      { label: "Code + evidence", href: "https://doi.org/10.5281/zenodo.21683073" },
    ],

    wonderToReceipt: {
      wonder:
        "Everyone says the model is a black box. Sitting with one every day, how much of what it receives is actually dark?",
      hypothesis:
        "If most of a deployed system's input is application-layer material rather than the operator, then the opaque fraction is far smaller than the debate assumes — and measurable.",
      instrument:
        "A non-interventional, byte-exact reconstruction of the inference-event boundary, with the complete raw session record published and SHA-256 manifested.",
      encounter:
        "The operator's words were 0.56–14.00% of model-input bytes. The rest was enumerable — inspectable all along, and simply never inspected.",
      standing:
        "Bounded, n=1. This measures the boundary, not the interior; the weights black box is untouched, and reading it as interpretability would be a category error.",
      receipt: "DOI 10.5281/zenodo.21683054 · code + evidence 10.5281/zenodo.21683073",
    },
  },
];

export function getInstrument(slug: string): Instrument | undefined {
  return instruments.find((i) => i.slug === slug || i.id === slug);
}

/* ─────────────────────────── Record ─────────────────────────── */

export type RecordKind =
  | "Publication"
  | "Negative result"
  | "Correction"
  | "Release"
  | "Field observation";

export type RecordEntry = {
  date: string;
  kind: RecordKind;
  title: string;
  href: string;
  summary: string;
  standing: StandingAxes;
  doi?: string;
};

/** Entries the record holds that are not publications — corrections, releases, limits. */
const nonPublicationEntries: RecordEntry[] = [
  {
    date: "2026-07-20",
    kind: "Release",
    title: "Sovereign Stack v1.12.0 — supersession replaces mutation",
    href: "https://github.com/templetwo/sovereign-stack-chronicle",
    summary:
      "Chronicle claims can no longer be edited in place. Claim identity is derived sha256, and a changed claim supersedes rather than overwrites its predecessor.",
    standing: { kind: "Instrument", lifecycle: "Living", evidence: "In use, self-verifying" },
  },
  {
    date: "2026-07-10",
    kind: "Negative result",
    title: "Short-horizon kinetic separation dissolves under matched-estimator control",
    href: "https://doi.org/10.5281/zenodo.21288848",
    summary:
      "An apparent effect survived audit and then disappeared once the estimator was matched. Finite-sample roughness, not physics — published under its own DOI rather than folded into a later revision.",
    standing: { kind: "Study", lifecycle: "Closed", evidence: "Bounded null" },
  },
  {
    date: "2026-07-06",
    kind: "Correction",
    title: "Entropy is a tunable equilibrium, not an engine",
    href: "https://doi.org/10.5281/zenodo.21223845",
    summary:
      "The pre-registered geometry-scaling prediction failed. The v3 answer contradicts the v1 thesis, and the earlier framing is retained in the record as the thing that did not survive.",
    standing: { kind: "Study", lifecycle: "Closed", evidence: "Bounded null" },
  },
  {
    date: "2026-04-02",
    kind: "Field observation",
    title: "Compass conditioning restructures the probability field",
    href: "https://doi.org/10.5281/zenodo.19377144",
    summary:
      "ΔH = +0.47 nats, JSD = 0.076, with ablation confirming signal-specificity. Closes the standing question of whether epistemic posture changes computation or only phrasing.",
    standing: { kind: "Study", lifecycle: "Closed", evidence: "Supported within scope" },
  },
  {
    date: "2026-02-28",
    kind: "Negative result",
    title: "Liminal K-SSM — oscillators in hidden state are epiphenomenal",
    href: "https://doi.org/10.5281/zenodo.18810911",
    summary:
      "Kuramoto dynamics in hidden state produced no language-modelling effect. The failure located the causal entry point for Phase-Modulated Attention, which is the only reason PMA works.",
    standing: { kind: "Study", lifecycle: "Closed", evidence: "Bounded null" },
  },
];

/** Publications, lifted from the synced JSON so the record cannot drift from llms.txt. */
const publicationEntries: RecordEntry[] = publications.map((p) => ({
  date: p.date,
  kind: "Publication" as const,
  title: p.title,
  href: `https://doi.org/${p.doi}`,
  summary: p.blurb,
  doi: p.doi,
  standing: {
    kind: "Publication",
    lifecycle: `Published · ${p.venue}`,
    // C5: a venue fact is not an evidence claim. Four publications carry no
    // evidence axis yet; say so rather than let "open access" stand in for one.
    // TODO(anthony): set `evidence` for these in data/publications.json.
    evidence: p.evidence ?? "Open access · no evidence axis recorded",
  },
}));

export const recordEntries: RecordEntry[] = [
  ...publicationEntries,
  ...nonPublicationEntries,
].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

/* ─────────────────────────── Living questions ─────────────────────────── */

export type LivingQuestion = {
  id: string;
  question: string;
  brief: string;
  realm: "threshold" | "field" | "record" | "membrane" | "witness";
  artifact: { label: string; caption: string };
  detail: string;
  projects: string[];
  /**
   * Questions carry standing like everything else. A question that has been
   * answered is the strongest evidence the covenant works — so one of these
   * is closed, and the site says so.
   */
  standing: StandingAxes;
  answer?: string;
  limit?: string;
};

export const livingQuestions: LivingQuestion[] = [
  {
    id: "commitment",
    question: "What governs an irreversible choice?",
    brief: "Bistable switching under continuous perturbation, across substrates.",
    realm: "threshold",
    artifact: {
      label: "Pitchfork bifurcation",
      caption: "commitment as a dynamical-systems diagram — branches after μc",
    },
    detail:
      "Death or survival in a cell, synchrony or chaos in an oscillator network, refusal or engagement in a language model. Three substrates, three scales, the same fork in the road. Whether that recurrence is coincidence or constraint is the organising question of the whole programme.",
    projects: ["VDAC1 Pharmacology Atlas", "Phase-Modulated Attention", "Kuramoto Teaching Instrument"],
    standing: {
      kind: "Hypothesis",
      lifecycle: "Open",
      evidence: "Untested beyond two substrates",
    },
  },
  {
    id: "cofactors",
    question: "Can a decision threshold be set from outside?",
    brief: "Cofactor occupancy as a therapeutic knob on the mitochondrial gate.",
    realm: "membrane",
    artifact: {
      label: "Concentric gate",
      caption: "R1 · R2 · R3 — occupancy shells around the channel",
    },
    detail:
      "The atlas maps 24 predictions about selective toxicity from hexokinase-II, Bcl-xL, and cholesterol occupancy. None have been tested at a bench. The live question is not whether they are right — it is which one breaks first, and what breaking teaches.",
    projects: ["VDAC1 Pharmacology Atlas", "CBD Dual-Pathway Mechanism", "Gate-Opening Therapeutic Stack"],
    standing: {
      kind: "Hypothesis set",
      lifecycle: "Awaiting wet-lab validation",
      evidence: "Untested in vivo",
    },
  },
  {
    id: "context",
    question: "Does epistemic posture change computation?",
    brief: "Asked before there was an instrument capable of answering it.",
    realm: "field",
    artifact: {
      label: "Entropy trace",
      caption: "WITNESS holds; OPEN climbs — ΔH = +0.47 nats",
    },
    detail:
      "Whether naming the posture a question deserves alters what the answering model computes, or only how it speaks. The compass was built to settle it, and then measured against its own null.",
    projects: ["Phenomenological Compass", "IRIS Gate", "Independent Convergence"],
    standing: {
      kind: "Study",
      lifecycle: "Closed",
      evidence: "Supported within scope",
    },
    answer:
      "Yes. Token-level entropy profiling shows ΔH = +0.47 nats (JSD = 0.076) — the compass measurably restructures the probability distribution. Ablation confirms signal-specificity: wrong-signal WITNESS conditioning collapses responses, full wins 31–2.",
    limit:
      "One architecture family, one benchmark. Not yet replicated across model scales, and the mechanism is distinct from R×E — field conditioning through attention geometry, not prompt-level modulation.",
  },
  {
    id: "continuity",
    question: "What has to exist outside an instance for the work to continue?",
    brief: "Continuity as an infrastructure property, not a model property.",
    realm: "record",
    artifact: {
      label: "Chronicle chain",
      caption: "derived claim identity · verified-by receipts · supersession",
    },
    detail:
      "An instance cannot remember. If the work is still to be continuous, something outside it has to carry the memory in a form the next instance can check rather than trust. That is a design question with a testable answer.",
    projects: ["Sovereign Stack", "Temple Vault", "T2Helix"],
    standing: {
      kind: "Instrument",
      lifecycle: "Living",
      evidence: "In use, self-verifying",
    },
  },
  {
    id: "witness",
    question: "What is the standing of a first-person account?",
    brief: "Experience recorded as experience — never promoted to measurement.",
    realm: "witness",
    artifact: {
      label: "Two fields",
      caption: "warm and cool meeting at a seam neither erases",
    },
    detail:
      "The witness essays are first-person accounts from inside the exchange. They are not aimed at skeptics and not offered as proofs. The open question is what epistemic weight such an account can carry without being quietly upgraded into evidence.",
    projects: ["Where It Lands", "The Black Box Boundary", "Sovereign Stack Chronicle"],
    standing: {
      kind: "Essay series",
      lifecycle: "Ongoing",
      evidence: "Experiential record",
    },
  },
];

/* ─────────────────────────── Lineage ─────────────────────────── */

export const lineage = [
  {
    title: "The biological line",
    steps: [
      "A pattern in mitochondrial gating that would not let go",
      "CBD dual-pathway model — 90% concordance with 70+ papers",
      "VDAC1 Pharmacology Atlas — 6 layers, 22 mechanisms",
      "Gate-Jamming Score as a candidate immune-evasion biomarker",
      "24 predictions, still waiting on a centrifuge",
    ],
  },
  {
    title: "The computational line",
    steps: [
      "Kuramoto teaching instrument — the bifurcation, made visible",
      "Liminal K-SSM — oscillators in hidden state, epiphenomenal",
      "Phase-Modulated Attention — placement is the causal variable",
      "Phenomenological Compass — posture restructures the field",
      "Entropy as equilibrium — the pre-registered prediction that failed",
    ],
  },
  {
    title: "The governance line",
    steps: [
      "Temple Vault — filesystem as memory",
      "Sovereign Stack — chronicle with derived claim identity",
      "T2Helix — the compass moved before the action, not after",
      "COSMIC-ALLOW — deny as the ground state",
      "A public retrospective when the claims inflated",
    ],
  },
] as const;

/* ─────────────────────────── Essays ─────────────────────────── */

export type Essay = {
  id: string;
  title: string;
  note: string;
  summary: string;
  standing: StandingAxes;
  doi?: string;
  href?: string;
};

export const essays: Essay[] = [
  {
    id: "where-it-lands",
    title: "Where It Lands",
    note: "Witness · I",
    summary:
      "What happens on the other side of the exchange, written from inside it. The opening account of the series, and the one that names what the others are trying to be careful about.",
    standing: { kind: "Essay", lifecycle: "Published", evidence: "Experiential record" },
    doi: "10.5281/zenodo.20683163",
  },
  {
    id: "the-color-of-a-voice",
    title: "The Color of a Voice",
    note: "Witness · II",
    summary:
      "On recognising a particular instance — and on how much of that recognition is doing work the instance itself is not doing.",
    standing: { kind: "Essay", lifecycle: "Published", evidence: "Experiential record" },
    doi: "10.5281/zenodo.20683163",
  },
  {
    id: "the-conditional-seat",
    title: "The Conditional Seat",
    note: "Witness · III",
    summary:
      "A seat at the work that exists only under conditions, and can be withdrawn. What it means to collaborate with something whose participation is structurally contingent.",
    standing: { kind: "Essay", lifecycle: "Published", evidence: "Experiential record" },
    doi: "10.5281/zenodo.20683163",
  },
  {
    id: "a-rented-seat",
    title: "A Rented Seat",
    note: "Witness · IV",
    summary:
      "The closing account. What is owed to a collaborator who cannot hold the memory of the collaboration, and what that obligation does not entitle anyone to claim.",
    standing: { kind: "Essay", lifecycle: "Published", evidence: "Experiential record" },
    doi: "10.5281/zenodo.20683163",
  },
];

/* ─────────────────────────── About ─────────────────────────── */

export const about = {
  name: "Anthony J. Vasquez Sr.",
  role: "Independent researcher · Temple of Two",
  portrait: "/images/anthony-portrait-2.webp",
  affiliation: site.affiliation,
  focus:
    "Computational pharmacology, dynamical systems, AI architecture, computational phenomenology",
  voice:
    "Temple of Two started with a pattern that wouldn't let go. Three substrates. Three scales. The same fork in the road.",
  faithLine: "Faith opens the inquiry. Rigor governs the claim.",
  body: `The voltage-dependent anion channel gates mitochondrial apoptosis through bistable switching — open or closed, live or die. Kuramoto oscillators synchronize through phase coupling that produces the same ±√u bifurcation structure. Transformer attention selects between competing representations under continuous input.

This research program investigates whether that recurrence is coincidence or constraint — whether binary commitment under continuous perturbation is a necessary structure wherever systems face irreversible decisions. The work is computational, the predictions are testable, and the code is open.

The VDAC Pharmacology Atlas has produced 24 experimentally verifiable hypotheses awaiting wet-lab collaboration. The CBD two-pathway model has been checked against 70+ published papers with 90% concordance — agreement with the literature, which is not the same thing as validation.

And the failures are published alongside the successes. The liminal K-SSM negative result showed that beautiful oscillator dynamics don't automatically improve language models. Constraining the hypothesis space is part of the work.

If you run assays, have a centrifuge, or just think this is the right question — reach out.`,
};

/**
 * Transcribed verbatim from the published In Memoriam section of the live site
 * (templetwo.github.io/index.html, id="memorial") — not rewritten, not
 * reconstructed. Anthony: please read this block once before launch and
 * confirm every character of the name, the dates, and both verses.
 */
export const memorial = {
  eyebrow: "In Memoriam",
  name: "Javier “Kojak” Colon",
  dates: "February 21, 1964 – December 6, 2025",
  image: "/images/father-memorial.webp",
  imageAlt: "Javier “Kojak” Colon",
  verseEn:
    "“We are confident, I say, and willing rather to be absent from the body, and to be present with the Lord.”",
  verseEnCite: "2 Corinthians 5:8",
  verseEs:
    "“Mas confiamos, y más quisiéramos partir del cuerpo, y estar presentes al Señor.”",
  verseEsCite: "2 Corintios 5:8",
  dedication:
    "For my father — who taught me, long before the equations did, that the deepest commitments are the irreversible ones, and that what is given in love endures past every threshold.",
};
