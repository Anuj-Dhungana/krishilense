import * as cheerio from "cheerio";

async function inspectLiveAmpis() {
  console.log("🌐 Connecting directly to live https://ampis.gov.np to inspect dropdown parameters...\n");

  const res = await fetch("https://ampis.gov.np", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  console.log("📋 Forms found on live ampis.gov.np:\n");

  $("form").each((i, form) => {
    const action = $(form).attr("action");
    const method = $(form).attr("method") || "GET";
    console.log(`--- Form #${i + 1} [Action: ${action} | Method: ${method}] ---`);

    $(form).find("select").each((_, select) => {
      const name = $(select).attr("name");
      const label = $(select).closest(".form-item, div").find("label").text().trim() || name;
      console.log(`\n  🔽 Dropdown: name="${name}" (Label: "${label}")`);

      $(select).find("option").each((_, opt) => {
        const val = $(opt).attr("value");
        const txt = $(opt).text().trim();
        if (val) {
          console.log(`     • Value: "${val}" ➔ "${txt}"`);
        }
      });
    });
  });

  // Check for the "View All" link
  $('a:contains("View All"), a:contains("सबै हेर्नुहोस्")').each((_, a) => {
    console.log(`\n🔗 "View All" button links to: "${$(a).attr("href")}"`);
  });
}

inspectLiveAmpis().catch(console.error);