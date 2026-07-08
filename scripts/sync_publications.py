#!/usr/bin/env python3
"""
sync_publications.py — regenerate every hand-copy-pasted publications/DOI
surface on thetempleoftwo.com from the single canonical source of truth,
data/publications.json.

Regenerates, in place, between AUTOGEN marker comments:
  - The JSON-LD `ScholarlyArticle` array in each of the five HTML pages
    (index.html, about.html, research.html, publications.html,
    sovereign-stack.html).
  - The DOI-count prose / stat counters in index.html and publications.html.
  - The "## Published works (DOIs)" section of llms.txt.
  - The SVG publication-cadence timeline in publications.html.

Stdlib only. Safe to run repeatedly — running it twice with no changes to
publications.json produces zero further diff (idempotent).

Usage:
    python3 scripts/sync_publications.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "data" / "publications.json"
LLMS_PATH = REPO_ROOT / "llms.txt"

HTML_FILES = [
    "index.html",
    "about.html",
    "research.html",
    "publications.html",
    "sovereign-stack.html",
]

# Files/spots where the DOI-count prose lives (safe, literal substring
# replacement — these sit inside HTML comments, meta attributes, or JSON-LD
# string values where an AUTOGEN HTML comment marker cannot be inserted
# without corrupting the surrounding syntax).
COUNT_PHRASE_FILES = ["index.html", "publications.html"]

AUTHOR_ID = "https://thetempleoftwo.com/#anthony"

MONTH_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
MONTH_FULL = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

# Fixed timeline axis: one tick per month from Oct 2025 through Jul 2026,
# matching the hand-authored SVG's existing month ticks. (year, month) -> x
AXIS_TICKS = {
    (2025, 10): 60,
    (2025, 11): 153,
    (2025, 12): 247,
    (2026, 1): 340,
    (2026, 2): 433,
    (2026, 3): 527,
    (2026, 4): 620,
    (2026, 5): 713,
    (2026, 6): 807,
    (2026, 7): 900,
}
AXIS_MONTH_SPAN = 93.333  # px between consecutive month ticks

VENUE_COLORS = {
    "Zenodo": "#a78bfa",
    "OSF": "#34d399",
    "Research Square": "#60a5fa",
}

NUMBER_WORDS = [
    None, "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
    "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three",
    "twenty-four", "twenty-five", "twenty-six", "twenty-seven", "twenty-eight",
    "twenty-nine", "thirty",
]


def num_to_word(n: int) -> str:
    """Number to lowercase English word, 1-30. Falls back to digits above 30."""
    if 1 <= n <= 30:
        return NUMBER_WORDS[n]
    return str(n)


def days_in_month(year: int, month: int) -> int:
    if month == 12:
        next_month = (year + 1, 1)
    else:
        next_month = (year, month + 1)
    import datetime
    first_this = datetime.date(year, month, 1)
    first_next = datetime.date(*next_month, 1)
    return (first_next - first_this).days


class ChangeTracker:
    def __init__(self):
        self.changed_files: list[str] = []

    def note(self, path: Path, changed: bool):
        if changed:
            self.changed_files.append(str(path.relative_to(REPO_ROOT)))


def load_publications() -> list[dict]:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    pubs = data["publications"]
    for p in pubs:
        assert p["doi"] and p["headline"] and p["title"] and p["venue"] and p["date"] and p["blurb"], p
        assert p["venue"] in VENUE_COLORS, f"Unknown venue {p['venue']!r} for {p['doi']}"
    return pubs


def parse_date(d: str):
    import datetime
    return datetime.date.fromisoformat(d)


# ---------------------------------------------------------------------------
# 1. JSON-LD ScholarlyArticle array
# ---------------------------------------------------------------------------

JSONLD_START = "<!-- AUTOGEN:PUBLICATIONS_JSONLD:START -->"
JSONLD_END = "<!-- AUTOGEN:PUBLICATIONS_JSONLD:END -->"


def build_jsonld_entries(pubs: list[dict]) -> str:
    lines = []
    for i, p in enumerate(pubs):
        entry = (
            '{ "@type": "ScholarlyArticle", '
            f'"headline": {json.dumps(p["headline"], ensure_ascii=False)}, '
            f'"identifier": {json.dumps(p["doi"], ensure_ascii=False)}, '
            f'"sameAs": {json.dumps("https://doi.org/" + p["doi"], ensure_ascii=False)}, '
            f'"author": {{ "@id": {json.dumps(AUTHOR_ID, ensure_ascii=False)} }} }}'
        )
        suffix = "," if i < len(pubs) - 1 else ""
        lines.append("          " + entry + suffix)
    return "\n".join(lines)


def sync_jsonld(filename: str, pubs: list[dict], tracker: ChangeTracker):
    path = REPO_ROOT / filename
    text = path.read_text(encoding="utf-8")

    start_i = text.index(JSONLD_START)
    end_i = text.index(JSONLD_END, start_i)
    block = text[start_i:end_i]

    hp_marker = '"hasPart": [\n'
    hp_start = block.index(hp_marker) + len(hp_marker)
    hp_end = block.index("\n        ]", hp_start)

    new_entries = build_jsonld_entries(pubs)
    new_block = block[:hp_start] + new_entries + block[hp_end:]
    new_text = text[:start_i] + new_block + text[end_i:]

    changed = new_text != text
    if changed:
        path.write_text(new_text, encoding="utf-8")
    tracker.note(path, changed)
    return changed


# ---------------------------------------------------------------------------
# 2. DOI-count prose
# ---------------------------------------------------------------------------

COUNT_STAT_START = "<!-- AUTOGEN:PUBLICATIONS_COUNT_STAT:START -->"
COUNT_STAT_END = "<!-- AUTOGEN:PUBLICATIONS_COUNT_STAT:END -->"
COUNT_INLINE_START = "<!-- AUTOGEN:PUBLICATIONS_COUNT_INLINE:START -->"
COUNT_INLINE_END = "<!-- AUTOGEN:PUBLICATIONS_COUNT_INLINE:END -->"
COUNT_DESC_START = "<!-- AUTOGEN:PUBLICATIONS_COUNT_DESC:START -->"
COUNT_DESC_END = "<!-- AUTOGEN:PUBLICATIONS_COUNT_DESC:END -->"


def replace_between(text: str, start_marker: str, end_marker: str, transform) -> str:
    """Replace the content strictly between two marker comments using transform(old)->new."""
    start_i = text.index(start_marker) + len(start_marker)
    end_i = text.index(end_marker, start_i)
    old = text[start_i:end_i]
    new = transform(old)
    return text[:start_i] + new + text[end_i:]


def sync_doi_counts(filename: str, count: int, tracker: ChangeTracker):
    path = REPO_ROOT / filename
    text = path.read_text(encoding="utf-8")
    original = text

    word_cap = num_to_word(count).capitalize()
    word_lower = num_to_word(count)

    # Marker-scoped: stat-num data-count + display digits (index.html)
    if COUNT_STAT_START in text:
        def fix_stat(old: str) -> str:
            new = re.sub(r'data-count="\d+"', f'data-count="{count}"', old, count=1)
            new = re.sub(r'>\d+</div>', f'>{count}</div>', new, count=1)
            return new
        text = replace_between(text, COUNT_STAT_START, COUNT_STAT_END, fix_stat)

    # Marker-scoped: inline "<strong>N</strong> DOIs" (index.html)
    if COUNT_INLINE_START in text:
        def fix_inline(old: str) -> str:
            return re.sub(r'>\d+</strong> DOIs', f'>{count}</strong> DOIs', old, count=1)
        text = replace_between(text, COUNT_INLINE_START, COUNT_INLINE_END, fix_inline)

    # Marker-scoped: "Fifteen DOIs across Zenodo, Research Square, and OSF" (publications.html)
    if COUNT_DESC_START in text:
        def fix_desc(old: str) -> str:
            return re.sub(r'^\w+(?= DOIs across Zenodo, Research Square, and OSF)', word_cap, old)
        text = replace_between(text, COUNT_DESC_START, COUNT_DESC_END, fix_desc)

    # Unmarked, literal-phrase replacements — these live inside HTML comments,
    # meta attribute values, or JSON-LD string values where an HTML comment
    # marker cannot be safely inserted without corrupting the syntax. Anchored
    # on the distinctive, stable phrase "<number-word> DOI-backed records";
    # matches any known number word (not just the current one) so the count
    # can go up *or* down between runs and still resync correctly.
    number_words_lower = {w for w in NUMBER_WORDS if w}

    def fix_count_word(m: "re.Match") -> str:
        word = m.group(1)
        if word.lower() in number_words_lower:
            repl = word_cap if word[:1].isupper() else word_lower
            return f"{repl} DOI-backed records"
        return m.group(0)

    text = re.sub(r"\b([A-Za-z-]+)\s+DOI-backed records\b", fix_count_word, text)

    changed = text != original
    if changed:
        path.write_text(text, encoding="utf-8")
    tracker.note(path, changed)
    return changed


# ---------------------------------------------------------------------------
# 3. llms.txt
# ---------------------------------------------------------------------------

LLMS_START = "<!-- AUTOGEN:PUBLICATIONS_LLMSTXT:START -->"
LLMS_END = "<!-- AUTOGEN:PUBLICATIONS_LLMSTXT:END -->"


def sync_llms_txt(pubs: list[dict], tracker: ChangeTracker):
    path = LLMS_PATH
    text = path.read_text(encoding="utf-8")

    ordered = sorted(pubs, key=lambda p: parse_date(p["date"]), reverse=True)
    lines = [
        f'- {p["title"]} ({p["blurb"].rstrip(".")}) — https://doi.org/{p["doi"]}'
        for p in ordered
    ]
    new_section = "\n" + "\n".join(lines) + "\n"

    new_text = replace_between(text, LLMS_START, LLMS_END, lambda _old: new_section)
    changed = new_text != text
    if changed:
        path.write_text(new_text, encoding="utf-8")
    tracker.note(path, changed)
    return changed


# ---------------------------------------------------------------------------
# 4. SVG publication-cadence timeline (publications.html)
# ---------------------------------------------------------------------------

TIMELINE_HEADER_START = "<!-- AUTOGEN:PUBLICATIONS_TIMELINE_HEADER:START -->"
TIMELINE_HEADER_END = "<!-- AUTOGEN:PUBLICATIONS_TIMELINE_HEADER:END -->"
TIMELINE_SVG_START = "<!-- AUTOGEN:PUBLICATIONS_TIMELINE_SVG:START -->"
TIMELINE_SVG_END = "<!-- AUTOGEN:PUBLICATIONS_TIMELINE_SVG:END -->"


def timeline_x(date) -> float:
    key = (date.year, date.month)
    if key not in AXIS_TICKS:
        # Out-of-range date: clamp to nearest axis edge and warn. The axis
        # itself (Oct 2025 - Jul 2026) is not auto-extended; see README note
        # in the generated summary.
        earliest = min(AXIS_TICKS)
        latest = max(AXIS_TICKS)
        clamped = earliest if (date.year, date.month) < earliest else latest
        print(
            f"  WARNING: {date.isoformat()} falls outside the fixed timeline axis "
            f"(Oct 2025 - Jul 2026); clamped to {clamped[1]}/{clamped[0]} for chart purposes. "
            "Extend AXIS_TICKS in scripts/sync_publications.py if the range needs to grow."
        )
        key = clamped
    tick_x = AXIS_TICKS[key]
    dim = days_in_month(*key)
    return tick_x + (date.day / dim) * AXIS_MONTH_SPAN


def _timeline_facts(pubs: list[dict]):
    """Shared date/x-position math for both the header span and the SVG."""
    entries = sorted(pubs, key=lambda p: parse_date(p["date"]))
    dates = [parse_date(p["date"]) for p in entries]
    count = len(entries)
    word_lower = num_to_word(count)
    start_date, end_date = dates[0], dates[-1]
    start_mon = MONTH_ABBR[start_date.month - 1].capitalize()
    end_mon = MONTH_ABBR[end_date.month - 1].capitalize()
    return entries, dates, count, word_lower, start_date, end_date, start_mon, end_mon


def build_timeline_header(pubs: list[dict]) -> str:
    _, _, _, word_lower, start_date, end_date, start_mon, end_mon = _timeline_facts(pubs)
    return f"{word_lower} records, {start_mon} {start_date.year} &ndash; {end_mon} {end_date.year}"


def build_timeline_svg(pubs: list[dict]) -> str:
    entries, dates, count, word_lower, start_date, end_date, start_mon, end_mon = _timeline_facts(pubs)

    # Compute x per entry, then stagger y to avoid overlapping dots.
    xs = [round(timeline_x(d), 1) for d in dates]
    ys = []
    stems = []
    last_x = None
    for x in xs:
        if last_x is not None and abs(x - last_x) < 8:
            ys.append(64)
            stems.append(x)
        else:
            ys.append(82)
        last_x = x

    circle_lines = []
    for p, x, y in zip(entries, xs, ys):
        color = VENUE_COLORS[p["venue"]]
        circle_lines.append(f'          <circle cx="{x:g}" cy="{y}" r="5.5" fill="{color}"/>')

    stem_lines = [
        f'          <line x1="{x:g}" y1="64" x2="{x:g}" y2="82"/>' for x in stems
    ]
    stems_block = (
        '        <g stroke="#2a2a36" stroke-width="1">\n'
        + "\n".join(stem_lines)
        + ("\n" if stem_lines else "")
        + "        </g>"
    ) if stem_lines else '        <g stroke="#2a2a36" stroke-width="1"></g>'

    aria_label = (
        f"Timeline of {word_lower} DOI-backed records from {MONTH_FULL[start_date.month - 1]} "
        f"{start_date.year} to {MONTH_FULL[end_date.month - 1]} {end_date.year}, colored by venue "
        "(Zenodo, OSF, Research Square)."
    )

    return f"""<svg viewBox="0 0 960 132" role="img" aria-label="{aria_label}" style="width:100%; height:auto; display:block;">
        <line x1="60" y1="82" x2="900" y2="82" stroke="#2a2a36" stroke-width="1.5"/>
        <line x1="293" y1="46" x2="293" y2="90" stroke="#2a2a36" stroke-width="1" stroke-dasharray="2 3"/>
        <text x="287" y="54" text-anchor="end" font-family="Inter,sans-serif" font-size="10" fill="#57534e">2025</text>
        <text x="299" y="54" font-family="Inter,sans-serif" font-size="10" fill="#57534e">2026</text>
        <g font-family="Inter,sans-serif" font-size="11" fill="#78716c">
          <line x1="60" y1="78" x2="60" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="60" y="106" text-anchor="middle">OCT</text>
          <line x1="153" y1="78" x2="153" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="153" y="106" text-anchor="middle">NOV</text>
          <line x1="247" y1="78" x2="247" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="247" y="106" text-anchor="middle">DEC</text>
          <line x1="340" y1="78" x2="340" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="340" y="106" text-anchor="middle">JAN</text>
          <line x1="433" y1="78" x2="433" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="433" y="106" text-anchor="middle">FEB</text>
          <line x1="527" y1="78" x2="527" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="527" y="106" text-anchor="middle">MAR</text>
          <line x1="620" y1="78" x2="620" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="620" y="106" text-anchor="middle">APR</text>
          <line x1="713" y1="78" x2="713" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="713" y="106" text-anchor="middle">MAY</text>
          <line x1="807" y1="78" x2="807" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="807" y="106" text-anchor="middle">JUN</text>
          <line x1="900" y1="78" x2="900" y2="86" stroke="#2a2a36" stroke-width="1"/><text x="900" y="106" text-anchor="middle">JUL</text>
        </g>
{stems_block}
        <g stroke="#14141c" stroke-width="1.5">
{chr(10).join(circle_lines)}
        </g>
      </svg>"""


def sync_timeline(pubs: list[dict], tracker: ChangeTracker):
    path = REPO_ROOT / "publications.html"
    original = path.read_text(encoding="utf-8")

    text = replace_between(
        original, TIMELINE_HEADER_START, TIMELINE_HEADER_END, lambda _old: build_timeline_header(pubs)
    )
    text = replace_between(
        text, TIMELINE_SVG_START, TIMELINE_SVG_END,
        lambda _old: "\n      " + build_timeline_svg(pubs) + "\n      ",
    )

    changed = text != original
    if changed:
        path.write_text(text, encoding="utf-8")
    tracker.note(path, changed)
    return changed


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------


def main():
    pubs = load_publications()
    count = len(pubs)
    tracker = ChangeTracker()

    for f in HTML_FILES:
        sync_jsonld(f, pubs, tracker)

    for f in COUNT_PHRASE_FILES:
        sync_doi_counts(f, count, tracker)

    sync_llms_txt(pubs, tracker)
    sync_timeline(pubs, tracker)

    changed = sorted(set(tracker.changed_files))
    print(f"sync_publications: {count} publications in data/publications.json")
    if changed:
        print(f"Updated {len(changed)} file(s):")
        for f in changed:
            print(f"  - {f}")
    else:
        print("No changes needed — all generated sections already match publications.json.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
