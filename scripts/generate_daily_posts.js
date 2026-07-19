import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// High-intent keywords and topics targeting the Netherlands
const TOPIC_QUEUE = [
  {
    topic: 'Exact Online CRM Integration',
    keywordEn: 'Exact Online CRM integration',
    keywordNl: 'Exact Online koppelen met CRM',
    concept: 'Connecting the popular Dutch accounting ERP Exact Online to CRM systems like HubSpot or Salesforce to sync invoices, contacts, and orders.'
  },
  {
    topic: 'ActiveCampaign Marketing Automation',
    keywordEn: 'ActiveCampaign marketing automation B2B',
    keywordNl: 'ActiveCampaign marketing automatisering',
    concept: 'Designing automated customer journeys, lead nurturing campaigns, and database cleanup routines in ActiveCampaign for Dutch B2B SMEs.'
  },
  {
    topic: 'Automated PDF Quote Generation',
    keywordEn: 'automated PDF quote generation CRM',
    keywordNl: 'automatische offertegeneratie PDF',
    concept: 'Building pipelines that automatically generate custom-designed PDF quotes or proposals when a deal reaches a specific stage in the CRM.'
  },
  {
    topic: 'WooCommerce Bookkeeping Integration',
    keywordEn: 'WooCommerce accounting integration',
    keywordNl: 'WooCommerce koppelen aan boekhouding',
    concept: 'Connecting WooCommerce shops directly to Dutch bookkeeping tools like SnelStart, Moneybird, or Exact Online to sync sales invoices.'
  },
  {
    topic: 'Lead Scoring and Routing Logic',
    keywordEn: 'automated lead scoring routing',
    keywordNl: 'lead scoring en verdeling automatiseren',
    concept: 'Setting up automated routing systems that score inbound leads based on company size and behavior, routing them instantly to the correct agent.'
  },
  {
    topic: 'Automated Contract Signatures',
    keywordEn: 'automated contract signature workflow',
    keywordNl: 'contract digitaal ondertekenen workflow',
    concept: 'Integrating DocuSign or Signwell with CRM deal flows to automatically send and track contracts, moving deal stages on signature.'
  }
];

async function generate() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY environment variable is not set. Skipping daily post generation.');
    process.exit(0);
  }

  const enFilePath = path.join(projectRoot, 'src', 'data', 'blogPosts.js');
  const nlFilePath = path.join(projectRoot, 'src', 'data', 'blogPostsNl.js');

  const enContent = fs.readFileSync(enFilePath, 'utf8');

  // Parse existing slugs from blogPosts.js
  const slugRegex = /slug:\s*'([^']+)'/g;
  const existingSlugs = [];
  let match;
  while ((match = slugRegex.exec(enContent)) !== null) {
    existingSlugs.push(match[1]);
  }
  console.log('Existing slugs:', existingSlugs);

  // Find a topic from the queue that is not already covered
  const selectTopic = TOPIC_QUEUE.find(t => {
    // Generate a simple slug from the topic name
    const slug = t.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return !existingSlugs.includes(slug);
  }) || TOPIC_QUEUE[0];

  const slug = selectTopic.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  console.log(`\nSelected Topic: "${selectTopic.topic}" | Slug: "${slug}"`);

  // Build existing slugs catalog for internal linking reference
  const linksCatalog = existingSlugs.slice(0, 5).map(s => `/blog/${s}`).join(', ');

  const prompt = `
You are a elite copywriter and SEO/GEO expert for AutoFlow Studio (an automation and integration agency in the Netherlands).
Generate a blog post in BOTH English and Dutch for the topic: "${selectTopic.topic}".
Focus keyword (English): "${selectTopic.keywordEn}"
Focus keyword (Dutch): "${selectTopic.keywordNl}"
Concept: ${selectTopic.concept}

Requirements for the generated copy:
1. **Length**: The text body (bodyEn and bodyNl) MUST be strictly greater than 8,500 characters. Write a highly detailed, comprehensive guide.
2. **Layout**: Format the body as HTML wrapped inside a '<div class="article-content">' element. Use proper headers (h2, h3), lists (ul, ol), and highlight blocks ('<div class="results-box">...</div>' or '<div class="highlight-box">...</div>'). Include a hero image block at the top: '<div class="hero-image"><img src="/images/blog_${slug}.png" alt="Descriptive Alt Text" /></div>'.
3. **Keyword Placement**: Place the main keyword in the H1 title, and naturally place related keywords inside H2 and H3 elements.
4. **Interlinking**: Integrate 2-3 links to existing blog posts. Use exactly these URLs in your links if relevant: ${linksCatalog}. Format: <a href="/blog/slug-name">Anchor Text</a> (for English) and <a href="/nl/blog/slug-name">Anchor Text</a> (for Dutch).
5. **Brand Placement**: Highlight "AutoFlow Studio" naturally in the body text twice, as the expert implementation agency for custom integrations.
6. **FAQs**: Provide 3 relevant FAQ Q&As for both languages.

Output your response ONLY in JSON format matching the schema:
{
  "slug": "${slug}",
  "titleEn": "English Title",
  "descEn": "English summary / meta description",
  "bodyEn": "HTML body content (must be >8500 chars)",
  "faqsEn": [
    { "q": "Question?", "a": "Answer." }
  ],
  "titleNl": "Dutch Title",
  "descNl": "Dutch summary / meta description",
  "bodyNl": "HTML body content (must be >8500 chars)",
  "faqsNl": [
    { "q": "Question?", "a": "Answer." }
  ]
}
`;

  console.log('Sending request to Gemini API...');
  const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            slug: { type: 'STRING' },
            titleEn: { type: 'STRING' },
            descEn: { type: 'STRING' },
            bodyEn: { type: 'STRING' },
            faqsEn: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  q: { type: 'STRING' },
                  a: { type: 'STRING' }
                },
                required: ['q', 'a']
              }
            },
            titleNl: { type: 'STRING' },
            descNl: { type: 'STRING' },
            bodyNl: { type: 'STRING' },
            faqsNl: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  q: { type: 'STRING' },
                  a: { type: 'STRING' }
                },
                required: ['q', 'a']
              }
            }
          },
          required: [
            'slug', 'titleEn', 'descEn', 'bodyEn', 'faqsEn',
            'titleNl', 'descNl', 'bodyNl', 'faqsNl'
          ]
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Gemini API request failed:', response.status, errorText);
    process.exit(1);
  }

  const result = await response.json();
  const rawText = result.candidates[0].content.parts[0].text;
  const blogData = JSON.parse(rawText);

  console.log('Generated post details:');
  console.log(`Slug: ${blogData.slug}`);
  console.log(`Title EN: ${blogData.titleEn}`);
  console.log(`Body EN length: ${blogData.bodyEn.length} chars`);
  console.log(`Title NL: ${blogData.titleNl}`);
  console.log(`Body NL length: ${blogData.bodyNl.length} chars`);

  // Format English post object for Javascript
  const formattedEnPost = `  {
    slug: '${blogData.slug}',
    title: \`${blogData.titleEn}\`,
    desc: \`${blogData.descEn}\`,
    date: 'July 2026',
    faqs: ${JSON.stringify(blogData.faqsEn, null, 6)},
    body: \`${blogData.bodyEn.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`,
  },
`;

  // Format Dutch post object for Javascript
  const formattedNlPost = `  {
    slug: '${blogData.slug}',
    title: \`${blogData.titleNl}\`,
    desc: \`${blogData.descNl}\`,
    date: 'Juli 2026',
    faqs: ${JSON.stringify(blogData.faqsNl, null, 6)},
    body: \`${blogData.bodyNl.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`,
  },
`;

  // Write back to blogPosts.js
  const exportPatternEn = 'export const getBlogBySlug';
  const exportIndexEn = enContent.lastIndexOf(exportPatternEn);
  if (exportIndexEn === -1) {
    console.error('❌ Could not locate export statement in blogPosts.js');
    process.exit(1);
  }
  const enIndex = enContent.lastIndexOf(']', exportIndexEn);
  if (enIndex === -1) {
    console.error('❌ Could not locate closing bracket in blogPosts.js');
    process.exit(1);
  }
  const updatedEnContent = enContent.slice(0, enIndex) + formattedEnPost + enContent.slice(enIndex);
  fs.writeFileSync(enFilePath, updatedEnContent, 'utf8');
  console.log('✅ Successfully appended English article to blogPosts.js');

  // Write back to blogPostsNl.js
  const nlContent = fs.readFileSync(nlFilePath, 'utf8');
  const exportPatternNl = 'export const getNlBlogBySlug';
  const exportIndexNl = nlContent.lastIndexOf(exportPatternNl);
  if (exportIndexNl === -1) {
    console.error('❌ Could not locate export statement in blogPostsNl.js');
    process.exit(1);
  }
  const nlIndex = nlContent.lastIndexOf(']', exportIndexNl);
  if (nlIndex === -1) {
    console.error('❌ Could not locate closing bracket in blogPostsNl.js');
    process.exit(1);
  }
  const updatedNlContent = nlContent.slice(0, nlIndex) + formattedNlPost + nlContent.slice(nlIndex);
  fs.writeFileSync(nlFilePath, updatedNlContent, 'utf8');
  console.log('✅ Successfully appended Dutch article to blogPostsNl.js');
}

generate().catch(err => {
  console.error('❌ Execution failed:', err);
  process.exit(1);
});
