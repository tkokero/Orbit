const {newsBanner}=require('./game-news.cjs');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Steam BBCode becomes a small static article vocabulary. No source HTML executes. */
function article(contents){
 const images=[];let text=String(contents||'').slice(0,200000).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,(_,src)=>'[img]'+src+'[/img]').replace(/<\/?(?:p|div|h[1-6]|li|br)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'');
 text=escape(text).replace(/\[img\](.*?)\[\/img\]/gis,(_,source)=>{const url=newsBanner('[img]'+source.replace(/&amp;/g,'&')+'[/img]');if(!url||images.length>=16)return '';const index=images.push(url)-1;return `<figure><img data-article-image="${index}" alt="Article image" loading="lazy" decoding="async"></figure>`;});
 text=text.replace(/\[(h[1-6]|b|i|u|strike|quote|code|list|olist)\]/gi,(_,tag)=>'<'+({b:'strong',i:'em',u:'u',strike:'s',quote:'blockquote',code:'pre',list:'ul',olist:'ol'}[tag.toLowerCase()]||'h2')+'>').replace(/\[\/(h[1-6]|b|i|u|strike|quote|code|list|olist)\]/gi,(_,tag)=>'</'+({b:'strong',i:'em',u:'u',strike:'s',quote:'blockquote',code:'pre',list:'ul',olist:'ol'}[tag.toLowerCase()]||'h2')+'>').replace(/\[\*\]/g,'<br>• ').replace(/\[url(?:=[^\]]*)?\]([\s\S]*?)\[\/url\]/gi,'$1').replace(/\[\/?[a-z][^\]\n]{0,400}\]/gi,'').replace(/\r\n?/g,'\n').replace(/\n/g,'<br>');
 return {html:text,images};
}
module.exports={article};
