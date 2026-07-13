/* Dental Q - 統合アクセス解析（GA4 + Clarity + 独自カウンター）
 * 使い方: 下記IDを貼るだけで全ページに反映。空なら何もロードしない（安全）。
 */
(function () {
  'use strict';
  // ★★★ 計測ID（当面はマネとくのを流用。専用プロパティ作成後はここを差し替え） ★★★
  const GA4_ID = 'G-0NQHWCG4YM';    // ※マネとくと共用。GA4はホスト名で分離可
  const CLARITY_ID = 'wpude6ryte';  // ※マネとくと共用
  const GAS_TRACKER = '';           // 独自ダッシュボードは後日（Dental Q専用GAS作成時に設定）

  if (GAS_TRACKER) {
    try {
      const slug = (location.pathname.split('/').pop() || 'index').replace('.html', '');
      const body = JSON.stringify({ slug: slug, referrer: document.referrer || '', screen: window.innerWidth + 'x' + window.innerHeight });
      fetch(GAS_TRACKER, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: body, keepalive: true }).catch(function(){});
    } catch (_) {}
  }
  if (GA4_ID && GA4_ID.startsWith('G-')) {
    const s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', GA4_ID, { page_title: document.title, page_path: location.pathname });
    initArticleEvents();
  }
  if (CLARITY_ID) {
    (function (c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)}; t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i; y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window,document,'clarity','script',CLARITY_ID);
  }
  function initArticleEvents(){
    const milestones=new Set(); let maxScroll=0; let done=false;
    const pct=()=>Math.round((window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight))*100);
    const throttle=(fn,d)=>{let last=0;return function(){const n=Date.now();if(n-last>=d){last=n;fn.apply(this,arguments);}};};
    const slug=()=>location.pathname.split('/').pop().replace('.html','');
    window.addEventListener('scroll',throttle(function(){
      const p=pct(); if(p>maxScroll)maxScroll=p;
      [25,50,75,90].forEach(function(m){ if(p>=m&&!milestones.has(m)){ milestones.add(m);
        window.gtag('event','scroll_depth',{depth_percent:m,article_slug:slug()});
        if(m===90&&!done){done=true;window.gtag('event','read_complete',{article_slug:slug()});}
      }});
    },400),{passive:true});
    document.addEventListener('click',function(e){ const a=e.target.closest('a'); if(!a)return;
      const href=(a.href||'').toLowerCase(); const text=(a.textContent||'').trim().substring(0,50);
      if(href&&!href.includes(location.hostname)&&href.startsWith('http')){ let t='external';
        if(href.includes('rakuten'))t='rakuten'; else if(href.includes('amazon')||href.includes('amzn'))t='amazon';
        else if(href.includes('a8.net')||href.includes('valuecommerce')||href.includes('afi-b')||href.includes('moshimo'))t='affiliate';
        window.gtag('event','cta_click',{cta_type:t,cta_text:text,link_url:href,article_slug:slug()});
      }
    });
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden'){
      window.gtag('event','article_exit',{article_slug:slug(),max_scroll_percent:maxScroll,read_complete:done});
    }});
  }
})();
