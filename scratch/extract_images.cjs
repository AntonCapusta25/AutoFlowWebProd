const fs = require('fs');

function extractImages(filePath, varName) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`export const ${varName} = ([\\s\\S]*?);`, 'm');
    const match = content.match(regex);
    if (!match) return;

    const postsStr = match[1];
    // This is a bit hacky because it's JS code, not JSON
    // But we can use regex to find img src in body
    const postRegex = /slug: '(.*?)'[\s\S]*?body: `([\s\S]*?)`/g;
    let postMatch;
    const results = {};
    while ((postMatch = postRegex.exec(postsStr)) !== null) {
        const slug = postMatch[1];
        const body = postMatch[2];
        const imgMatch = body.match(/<img src="(.*?)"/);
        results[slug] = imgMatch ? imgMatch[1] : null;
    }
    return results;
}

const enImages = extractImages('src/data/blogPosts.js', 'BLOG_POSTS');
const nlImages = extractImages('src/data/blogPostsNl.js', 'NL_BLOG_POSTS');

console.log('EN:', JSON.stringify(enImages, null, 2));
console.log('NL:', JSON.stringify(nlImages, null, 2));
