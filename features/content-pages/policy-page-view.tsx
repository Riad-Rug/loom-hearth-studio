import Link from "next/link";
import type { ReactNode } from "react";

import { policyPages } from "@/features/content-pages/content-pages-data";
import type { PolicyPage } from "@/types/domain";

import styles from "./content-pages.module.css";

type PolicyPageViewProps = {
  slug: PolicyPage["slug"];
};

const tableSeparatorPattern = /^\|?(?:\s*:?-{3,}:?\s*\|)+(?:\s*:?-{3,}:?\s*\|?)$/;

function renderPlainBody(body: string) {
  return body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

function stripTrailingPunctuation(token: string) {
  const match = token.match(/^(.*?)([.,;:!?]+)?$/);

  return {
    value: match?.[1] ?? token,
    trailing: match?.[2] ?? "",
  };
}

function renderInline(text: string) {
  const pattern =
    /(\*\*[^*]+\*\*|\[[^\]]+\]\([^\)]+\)|`[^`]+`|(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)]+)?|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi;
  const matches = Array.from(text.matchAll(pattern));

  if (matches.length === 0) {
    return text;
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={`strong-${start}-${index}`}>{renderInline(token.slice(2, -2))}</strong>);
    } else if (token.startsWith("[") && token.includes("](")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);

      if (linkMatch) {
        nodes.push(
          <a key={`link-${start}-${index}`} href={linkMatch[2]}>
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(<code key={`code-${start}-${index}`}>{token.slice(1, -1)}</code>);
    } else if (token.includes("@")) {
      const { value, trailing } = stripTrailingPunctuation(token);

      nodes.push(
        <a key={`email-${start}-${index}`} href={`mailto:${value}`}>
          {value}
        </a>,
      );
      if (trailing) {
        nodes.push(trailing);
      }
    } else {
      const { value, trailing } = stripTrailingPunctuation(token);
      const href = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;

      nodes.push(
        <a key={`url-${start}-${index}`} href={href}>
          {value}
        </a>,
      );
      if (trailing) {
        nodes.push(trailing);
      }
    }

    lastIndex = start + token.length;
  });

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderBulletList(lines: string[], key: string) {
  return (
    <ul key={key}>
      {lines.map((line, lineIndex) => (
        <li key={`${key}-bullet-${lineIndex}`}>{renderInline(line.slice(2).trim())}</li>
      ))}
    </ul>
  );
}

function renderOrderedList(lines: string[], key: string) {
  return (
    <ol key={key}>
      {lines.map((line, lineIndex) => (
        <li key={`${key}-ordered-${lineIndex}`}>{renderInline(line.replace(/^\d+\. /, "").trim())}</li>
      ))}
    </ol>
  );
}

function renderMarkdownBody(body: string) {
  const blocks = body.trim().split(/\n\s*\n/);

  return blocks.map((block, index) => {
    if (block === "---") {
      return <hr key={index} />;
    }

    if (block.startsWith("### ")) {
      return <h3 key={index}>{renderInline(block.slice(4).trim())}</h3>;
    }

    if (block.startsWith("## ")) {
      return <h2 key={index}>{renderInline(block.slice(3).trim())}</h2>;
    }

    if (block.startsWith("# ")) {
      return <h1 key={index}>{renderInline(block.slice(2).trim())}</h1>;
    }

    const lines = block.split("\n");
    const tableStartIndex = lines.findIndex(
      (line, lineIndex) => line.includes("|") && tableSeparatorPattern.test(lines[lineIndex + 1] ?? ""),
    );

    if (tableStartIndex >= 0) {
      const tableLines = lines.slice(tableStartIndex);
      const headers = parseTableRow(tableLines[0]);
      const rows = tableLines.slice(2).map(parseTableRow);
      const preamble = lines.slice(0, tableStartIndex).join(" ").trim();

      return (
        <>
          {preamble ? <p key={`${index}-preamble`}>{renderInline(preamble)}</p> : null}
          <table key={`${index}-table`}>
            <thead>
              <tr>
                {headers.map((header, cellIndex) => (
                  <th key={`${index}-head-${cellIndex}`}>{renderInline(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${index}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${index}-cell-${rowIndex}-${cellIndex}`}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }

    if (lines.every((line) => /^- /.test(line))) {
      return renderBulletList(lines, `${index}`);
    }

    if (lines.every((line) => /^\d+\. /.test(line))) {
      return renderOrderedList(lines, `${index}`);
    }

    if (lines.length > 1 && lines.slice(1).every((line) => /^- /.test(line))) {
      return (
        <div key={index}>
          <p>{renderInline(lines[0].trim())}</p>
          {renderBulletList(lines.slice(1), `${index}-nested-bullets`)}
        </div>
      );
    }

    if (lines.length > 1 && lines.slice(1).every((line) => /^\d+\. /.test(line))) {
      return (
        <div key={index}>
          <p>{renderInline(lines[0].trim())}</p>
          {renderOrderedList(lines.slice(1), `${index}-nested-ordered`)}
        </div>
      );
    }

    return <p key={index}>{renderInline(lines.join(" "))}</p>;
  });
}

export function PolicyPageView({ slug }: PolicyPageViewProps) {
  const page = policyPages.find((item) => item.slug === slug);

  if (!page) {
    return null;
  }

  return (
    <div className={styles.page}>
      <article className={styles.policyShell}>
        {page.showPageHeader === false ? null : (
          <>
            <p className={styles.eyebrow}>Policy</p>
            <h1>{page.title}</h1>
          </>
        )}
        <div className={styles.policyBody}>
          {page.bodyFormat === "markdown"
            ? renderMarkdownBody(page.body)
            : renderPlainBody(page.body)}
        </div>
        <div className={styles.policyActions}>
          <Link className={styles.secondaryAction} href="/faq">
            Read the FAQ
          </Link>
          <Link className={styles.secondaryAction} href="/sourcing">
            Review sourcing
          </Link>
          <Link className={styles.primaryAction} href="/contact">
            Contact the studio
          </Link>
        </div>
      </article>
    </div>
  );
}