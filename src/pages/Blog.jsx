import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BLOG_POSTS } from '../data/blogPosts'
import { NL_BLOG_POSTS } from '../data/blogPostsNl'
import { getT } from '../i18n/translations'
import CTASection from '../components/CTASection'
import { supabase } from '../lib/supabase'

export default function Blog({ lang = 'en' }) {
  const t = getT(lang)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const base = lang === 'nl' ? '/nl/blog' : '/blog'

  useEffect(() => {
    document.title = `${t.blog.title} - AutoFlow Studio`
    document.documentElement.lang = lang
  }, [lang, t])

  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('lang', lang)
          .order('created_at', { ascending: false })

        if (error) throw error

        const staticPosts = lang === 'nl' ? NL_BLOG_POSTS : BLOG_POSTS
        const supabaseSlugs = new Set((data || []).map(p => p.slug))
        const filteredStatic = staticPosts.filter(p => !supabaseSlugs.has(p.slug))

        const formattedSupabase = (data || []).map(p => ({
          slug: p.slug,
          title: p.title,
          desc: p.desc_text,
          date: p.publish_date,
          body: p.body,
          faqs: p.faqs || []
        }))

        setPosts([...formattedSupabase, ...filteredStatic])
      } catch (err) {
        console.error('Error fetching blog posts from Supabase:', err)
        setPosts(lang === 'nl' ? NL_BLOG_POSTS : BLOG_POSTS)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [lang])

  return (
    <main className="main-content" style={{ background: '#050505' }}>
      <section style={{
        paddingTop: '140px', paddingBottom: '60px', textAlign: 'center',
        background: 'linear-gradient(180deg,#050505 0%,#0a0a0a 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute',top:'20%',left:'10%',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(209, 187, 251,0.07) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ maxWidth:'700px',margin:'0 auto',padding:'0 24px',position:'relative',zIndex:1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <img src="/images/logo.webp" alt="AutoFlow Studio Logo" style={{ height: '48px', width: 'auto' }} />
          </div>
          <span style={{ display:'inline-block',background:'rgba(209, 187, 251,0.12)',border:'1px solid rgba(209, 187, 251,0.3)',color:'#d1bbfb',padding:'6px 18px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'20px' }}>
            {t.blog.badge}
          </span>
          <h1 style={{ color:'#F8FAFC',fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,marginBottom:'16px',lineHeight:1.15 }}>{t.blog.title}</h1>
          <p style={{ color:'#94A3B8',fontSize:'1.05rem',lineHeight:1.7,maxWidth:'500px',margin:'0 auto' }}>{t.blog.sub}</p>
        </div>
      </section>

      <section style={{ padding:'60px 24px 100px',background:'#050505' }}>
        <div style={{ maxWidth:'1200px',margin:'0 auto' }}>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:'24px' }}>
            {loading ? (
              <div style={{ color: '#94A3B8', textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>
                Loading articles...
              </div>
            ) : posts.map((post) => {
              const imgMatch = post.body.match(/<img[^>]+src=["']([^"']+)["']/)
              const imgSrc = imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'
              
              return (
                <article key={post.slug}
                  style={{ 
                    background:'#0a0a0a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px', 
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)',
                    transition:'transform 0.25s,box-shadow 0.25s,border-color 0.25s',
                    display:'flex', flexDirection:'column' 
                  }}
                  onMouseOver={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 2px 20px rgba(255,255,255,0.25), 0 40px 80px rgba(0,0,0,0.9)';e.currentTarget.style.borderColor='rgba(209, 187, 251,0.3)'}}
                  onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}}>
                  <div style={{ height:'200px', overflow:'hidden', position:'relative', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <img src={imgSrc} alt={post.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                  </div>
                  <div style={{ padding:'28px',display:'flex',flexDirection:'column',flex:1 }}>
                    <span style={{ color:'#64748B',fontSize:'0.75rem',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'12px' }}>{post.date}</span>
                    <h2 style={{ color:'#F8FAFC',fontSize:'1.05rem',fontWeight:700,lineHeight:1.4,marginBottom:'12px',flex:0 }}>{post.title}</h2>
                    <p style={{ color:'#94A3B8',fontSize:'0.875rem',lineHeight:1.65,marginBottom:'24px',flex:1 }}>
                      {post.desc.length > 140 ? post.desc.slice(0,140)+'…' : post.desc}
                    </p>
                    <Link to={`${base}/${post.slug}`}
                      style={{ display:'inline-flex',alignItems:'center',gap:'6px',color:'#d1bbfb',fontWeight:600,fontSize:'0.875rem',textDecoration:'none',marginTop:'auto' }}>
                      {t.blog.readMore}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
      <CTASection lang={lang} />
    </main>
  )
}
