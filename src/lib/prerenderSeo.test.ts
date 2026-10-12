import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { headingFromTitle, renderPrerenderHtml, renderSpaShell, type PrerenderPage } from "./prerenderSeo";

const template = readFileSync(resolve(__dirname, "../../index.html"), "utf8");

const page: PrerenderPage = {
  path: "/shop/test-tee",
  title: "Test <Tee> | OFFGRID® Lifestyle",
  description: 'A "light" tee & more',
  imagePath: "/images/products/test.webp",
  type: "product",
  jsonLd: { "jsonld-product": { "@type": "Product", name: "</script><b>x" } },
  heading: "Test <Tee>",
  paragraphs: ["₱800"],
  links: [{ href: "/shop", label: "Shop" }],
};

describe("renderPrerenderHtml", () => {
  const html = renderPrerenderHtml(template, page);

  it("gives the URL its own canonical, title, description and OG tags", () => {
    expect(html).toContain('<link rel="canonical" href="https://www.oglifestyleph.com/shop/test-tee" />');
    expect(html).not.toContain('href="https://www.oglifestyleph.com/" />');
    expect(html).toContain("<title>Test &lt;Tee&gt; | OFFGRID® Lifestyle</title>");
    expect(html).toContain('<meta name="description" content="A &quot;light&quot; tee &amp; more" />');
    expect(html).toContain('<meta property="og:url" content="https://www.oglifestyleph.com/shop/test-tee" />');
    expect(html).toContain('<meta property="og:type" content="product" />');
    expect(html).toContain("https://www.oglifestyleph.com/images/products/test.webp");
  });

  it("ships crawlable body content and JSON-LD that cannot break out of its script tag", () => {
    expect(html).toContain("<h1>Test &lt;Tee&gt;</h1>");
    expect(html).toContain('<a href="/shop">Shop</a>');
    expect(html).toContain('id="jsonld-product">');
    expect(html).not.toContain("</script><b>x");
  });

  it("fails loudly if the template stops matching", () => {
    expect(() => renderPrerenderHtml("<html></html>", page)).toThrow(/missing/);
  });
});

describe("renderSpaShell", () => {
  it("drops the homepage canonical so unknown routes never claim to be /", () => {
    const shell = renderSpaShell(template);
    expect(shell).not.toMatch(/rel="canonical"/);
    expect(shell).not.toMatch(/og:url/);
    expect(shell).toContain('<div id="root" class="relative"></div>');
  });
});

describe("headingFromTitle", () => {
  it("strips the brand suffix but keeps the home title descriptive", () => {
    expect(headingFromTitle("Shop Filipino Sportswear | OFFGRID® Lifestyle")).toBe("Shop Filipino Sportswear");
    expect(headingFromTitle("OFFGRID® Lifestyle | Filipino Sportswear")).toBe("OFFGRID® Lifestyle — Filipino Sportswear");
  });
});
