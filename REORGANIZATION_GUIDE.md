# Website Reorganization Guide

This guide will help you safely reorganize your AutoFlow Studio website with proper SEO preservation.

## 📋 What This Does

- **Organizes files** into `/blog/` and `/projects/` folders
- **Cleans URLs** from messy names like `10%20repetitive%20tasks.html` to `10-repetitive-tasks.html`
- **Updates all internal links** automatically in both English and Dutch versions
- **Preserves SEO** with proper 301 redirects
- **Fixes robots.txt** to allow CSS/JS crawling (important for mobile SEO!)
- **Adds hreflang tags** for proper bilingual SEO

## 🚀 Step-by-Step Instructions

### Step 1: Backup Your Website
```bash
# Create a backup of your entire website
cp -r /Users/alexandrfilippov/Desktop/AutoFlowWebProd /Users/alexandrfilippov/Desktop/AutoFlowWebProd_BACKUP
```

### Step 2: Run the Reorganization Script
```bash
cd /Users/alexandrfilippov/Desktop/AutoFlowWebProd
python3 reorganize_site.py
```

The script will:
1. Create `/blog/` and `/projects/` folders
2. Update all internal links in HTML files
3. Move and rename files to clean URLs
4. Show you a progress report

### Step 3: Replace Configuration Files

After the script completes successfully:

```bash
# Replace the old sitemap with the new one
mv sitemap_new.xml sitemap.xml

# Replace the old robots.txt with the new one
mv robots_new.txt robots.txt

# Update your Vercel configuration
# Merge the contents of vercel_redirects.json into your existing vercel.json
```

### Step 4: Update vercel.json

Open your `vercel.json` and add the redirects. Your file should look like this:

```json
{
  "redirects": [
    {
      "source": "/blog.html",
      "destination": "/blog/",
      "permanent": true
    },
    {
      "source": "/portfolio.html",
      "destination": "/projects/",
      "permanent": true
    },
    // ... add all redirects from vercel_redirects.json
  ]
}
```

### Step 5: Test Locally

Before deploying, test everything:

1. **Check folder structure:**
   ```bash
   ls -la blog/
   ls -la projects/
   ls -la nl/blog/
   ls -la nl/projects/
   ```

2. **Open a few pages** in your browser:
   - Check that CSS loads correctly
   - Check that images display
   - Click navigation links to ensure they work
   - Test both English and Dutch versions

3. **Verify resource paths:**
   - Open browser DevTools (F12)
   - Check the Console for any 404 errors
   - Look for broken CSS, JS, or image paths

### Step 6: Deploy to Vercel

Once everything looks good locally:

```bash
git add .
git commit -m "Reorganize website structure with SEO-friendly URLs"
git push
```

Vercel will automatically deploy your changes.

### Step 7: Verify Redirects Work

After deployment, test the old URLs to ensure they redirect:

- Visit: `https://www.autoflowstudio.net/10%20repetitive%20tasks.html`
- Should redirect to: `https://www.autoflowstudio.net/blog/10-repetitive-tasks.html`

Test a few more:
- `/blog.html` → `/blog/`
- `/portfolio.html` → `/projects/`
- `/Project3.html` → `/projects/project-3.html`

### Step 8: Submit New Sitemap to Google

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (autoflowstudio.net)
3. Go to **Sitemaps** in the left menu
4. Submit: `https://www.autoflowstudio.net/sitemap.xml`
5. Google will re-crawl your site with the new structure

## 📊 New URL Structure

### Before → After

**Blog Posts:**
- `/10%20repetitive%20tasks.html` → `/blog/10-repetitive-tasks.html`
- `/BPA%20Guide.html` → `/blog/bpa-guide.html`
- `/zapier%20expert.html` → `/blog/zapier-expert.html`

**Projects:**
- `/project1.html` → `/projects/project-1.html`
- `/Project3.html` → `/projects/project-3.html`

**Main Pages:**
- `/blog.html` → `/blog/` (index page)
- `/portfolio.html` → `/projects/` (index page)

**Dutch Versions:**
- `/nl/blog.html` → `/nl/blog/`
- `/nl/10%20repetitive%20tasks.html` → `/nl/blog/10-repetitive-tasks.html`

## ⚠️ Important Notes

### robots.txt Changes
The new `robots.txt` **removes** the blocks on CSS and JS files. This is crucial because:
- Google renders pages like a browser
- If CSS/JS is blocked, Google sees your site as broken
- This hurts your mobile-first indexing score
- **This change will improve your SEO**

### hreflang Tags
The new sitemap includes `hreflang` tags that tell Google:
- Which pages are English versions
- Which pages are Dutch versions
- How they relate to each other

This prevents duplicate content issues and helps users find the right language version.

## 🔍 Troubleshooting

### CSS Not Loading
If CSS doesn't load after moving files:
1. Check that paths use `/css/` (absolute) not `css/` (relative)
2. The script should fix this automatically
3. If not, manually update: `href="css/style.css"` → `href="/css/style.css"`

### Images Not Loading
Same fix as CSS:
- `src="images/photo.jpg"` → `src="/images/photo.jpg"`

### Links Still Broken
1. Check the browser console for 404 errors
2. The script updates most common patterns
3. If you find a broken link, search all files:
   ```bash
   grep -r "old-filename.html" .
   ```

### Redirects Not Working
1. Verify `vercel.json` is properly formatted (valid JSON)
2. Check Vercel deployment logs for errors
3. Test redirects using curl:
   ```bash
   curl -I https://www.autoflowstudio.net/blog.html
   ```
   Should return `HTTP/1.1 308` (permanent redirect)

## 📞 Need Help?

If you encounter any issues:
1. Check the backup you created in Step 1
2. Review the script output for error messages
3. Test one page at a time to isolate the problem

## ✅ Success Checklist

- [ ] Backup created
- [ ] Script ran successfully
- [ ] New folders created (`/blog/`, `/projects/`, `/nl/blog/`, `/nl/projects/`)
- [ ] Files moved and renamed
- [ ] sitemap.xml replaced
- [ ] robots.txt replaced
- [ ] vercel.json updated with redirects
- [ ] Tested locally (CSS, images, links work)
- [ ] Deployed to Vercel
- [ ] Redirects tested and working
- [ ] New sitemap submitted to Google Search Console
- [ ] Both English and Dutch versions working

---

**Estimated Time:** 30-45 minutes
**Risk Level:** Low (with proper backup and testing)
**SEO Impact:** Positive (cleaner URLs, better mobile indexing, proper i18n)
