import Script from 'next/script';
import CodeInjector from './CodeInjector';

const id = (v) => String(v || '').replace(/[^A-Za-z0-9_-]/g, '');

/* Tracking and custom code from Admin > Integrations. Each one has its own on/off switch.
   Rendered only on the public site, never inside the admin. */
export default function Integrations({ cfg = {} }) {
  const ga = cfg.ga4?.enabled && id(cfg.ga4.id);
  const ads = cfg.googleAds?.enabled && id(cfg.googleAds.id);
  const gtagId = ga || ads;
  const gtm = cfg.gtm?.enabled && id(cfg.gtm.id);
  const px = cfg.metaPixel?.enabled && id(cfg.metaPixel.id);
  const clarity = cfg.clarity?.enabled && id(cfg.clarity.id);
  const cc = cfg.customCode || {};
  return (
    <>
      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${ga ? `gtag('config','${ga}');` : ''}${ads ? `gtag('config','${ads}');` : ''}`}</Script>
        </>
      )}
      {gtm && (
        <>
          <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
          <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} /></noscript>
        </>
      )}
      {px && <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${px}');fbq('track','PageView');`}</Script>}
      {clarity && <Script id="clarity" strategy="lazyOnload">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}</Script>}
      {cc.head?.enabled && <CodeInjector html={cc.head.code} where="head" />}
      {cc.bodyStart?.enabled && <CodeInjector html={cc.bodyStart.code} where="bodyStart" />}
      {cc.bodyEnd?.enabled && <CodeInjector html={cc.bodyEnd.code} where="bodyEnd" />}
    </>
  );
}

