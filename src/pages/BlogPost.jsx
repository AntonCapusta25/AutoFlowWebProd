import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { BLOG_POSTS, getBlogBySlug } from '../data/blogPosts'
import { NL_BLOG_POSTS, getNlBlogBySlug } from '../data/blogPostsNl'
import { getT } from '../i18n/translations'
import CTASection from '../components/CTASection'

export default function BlogPost({ lang = 'en' }) {
  const { slug } = useParams()
  const t = getT(lang)
  const isNl = lang === 'nl'
  const post = isNl ? getNlBlogBySlug(slug) : getBlogBySlug(slug)
  const posts = isNl ? NL_BLOG_POSTS : BLOG_POSTS
  const base = isNl ? '/nl/blog' : '/blog'

  useEffect(() => {
    if (post) document.title = `${post.title} - AutoFlow Studio`
    document.documentElement.lang = lang
    window.scrollTo(0, 0)
  }, [slug, post, lang])

  if (!post) return <Navigate to={base} replace />

  const idx = posts.findIndex(p => p.slug === slug)
  const prev = posts[idx - 1]
  const next = posts[idx + 1]

  return (
    <main className="main-content" style={{ background: '#050505' }}>
      <section style={{ paddingTop:'130px',paddingBottom:'50px',background:'linear-gradient(180deg,#050505 0%,#0a0a0a 100%)',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth:'800px',margin:'0 auto',padding:'0 24px' }}>
          <Link to={base} style={{ display:'inline-flex',alignItems:'center',gap:'6px',color:'#94A3B8',fontSize:'0.875rem',textDecoration:'none',marginBottom:'28px',transition:'color 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.color='#e91e63'} onMouseOut={e=>e.currentTarget.style.color='#94A3B8'}>
            {t.blog.backToBlog}
          </Link>
          <div style={{ display:'inline-block',background:'rgba(233,30,99,0.12)',border:'1px solid rgba(233,30,99,0.3)',color:'#e91e63',padding:'4px 14px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'20px' }}>
            {post.date}
          </div>
          <h1 style={{ color:'#F8FAFC',fontSize:'clamp(1.6rem,4vw,2.6rem)',fontWeight:800,lineHeight:1.2,marginBottom:'16px' }}>{post.title}</h1>
          <p style={{ color:'#94A3B8',fontSize:'1rem',lineHeight:1.7 }}>{post.desc}</p>
        </div>
      </section>

      <section style={{ padding:'60px 24px 80px',background:'#050505' }}>
        <div style={{ maxWidth:'800px',margin:'0 auto' }}>
          <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.body }} />

          {/* Prev/Next */}
          <div style={{ display:'flex',justifyContent:'space-between',gap:'16px',marginTop:'60px',paddingTop:'32px',borderTop:'1px solid rgba(255,255,255,0.08)',flexWrap:'wrap' }}>
            {prev ? (
              <Link to={`${base}/${prev.slug}`} style={{ flex:1,minWidth:'220px',background:'#0a0a0a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'20px',textDecoration:'none',transition:'all 0.2s',boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 10px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(233,30,99,0.3)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 2px 10px rgba(255,255,255,0.2), 0 20px 40px rgba(0,0,0,0.6)'}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 10px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)'}}>
                <div style={{ color:'#64748B',fontSize:'0.75rem',fontWeight:600,marginBottom:'6px' }}>{t.blog.prev}</div>
                <div style={{ color:'#F8FAFC',fontSize:'0.875rem',fontWeight:600,lineHeight:1.4 }}>{prev.title}</div>
              </Link>
            ) : <div style={{flex:1}} />}
            {next ? (
              <Link to={`${base}/${next.slug}`} style={{ flex:1,minWidth:'220px',background:'#0a0a0a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'20px',textDecoration:'none',textAlign:'right',transition:'all 0.2s',boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 10px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(233,30,99,0.3)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 2px 10px rgba(255,255,255,0.2), 0 20px 40px rgba(0,0,0,0.6)'}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 10px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)'}}>
                <div style={{ color:'#64748B',fontSize:'0.75rem',fontWeight:600,marginBottom:'6px' }}>{t.blog.next}</div>
                <div style={{ color:'#F8FAFC',fontSize:'0.875rem',fontWeight:600,lineHeight:1.4 }}>{next.title}</div>
              </Link>
            ) : <div style={{flex:1}} />}
          </div>

          <CTASection lang={lang} />
        </div>
      </section>

      <style>{`
        .blog-body { color: #CBD5E1; font-size: 1rem; line-height: 1.8; }
        .blog-body h1,.blog-body h2,.blog-body h3,.blog-body h4 { color: #F8FAFC; margin: 2em 0 0.75em; font-weight: 700; line-height: 1.3; }
        .blog-body h1 { font-size: 2rem; } .blog-body h2 { font-size: 1.5rem; } .blog-body h3 { font-size: 1.2rem; }
        .blog-body p { margin-bottom: 1.4em; }
        .blog-body ul,.blog-body ol { margin: 1em 0 1.4em 1.5em; }
        .blog-body li { margin-bottom: 0.5em; }
        .blog-body strong { color: #F8FAFC; font-weight: 700; }
        .blog-body a { color: #e91e63; text-decoration: underline; }
        .blog-body blockquote { border-left: 3px solid #e91e63; padding-left: 1.25em; margin: 1.5em 0; color: #94A3B8; font-style: italic; }
        .blog-body code { background: rgba(255,255,255,0.06); border-radius: 4px; padding: 2px 6px; font-size: 0.9em; color: #e91e63; }
        .blog-body table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
        .blog-body th { background: rgba(233,30,99,0.1); color: #F8FAFC; padding: 12px; text-align: left; border: 1px solid rgba(255,255,255,0.08); }
        .blog-body td { padding: 12px; border: 1px solid rgba(255,255,255,0.06); color: #CBD5E1; }
        .blog-body img { max-width: 100%; border-radius: 12px; margin: 1.5em 0; }
        .blog-body nav,.blog-body .navbar,.blog-body header,.blog-body .loading-screen { display: none !important; }
      `}</style>
    </main>
  )
}
