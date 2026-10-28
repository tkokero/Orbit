const test=require('node:test'),assert=require('node:assert/strict'),{article}=require('../src/news-content.cjs');
test('Steam articles retain their complete text and readable BBCode formatting',()=>{const result=article('[h1]Update[/h1]\n[b]New features[/b]\n'+('Full article. '.repeat(1000)));assert.ok(result.html.includes('<h2>Update</h2>'));assert.ok(result.html.includes('<strong>New features</strong>'));assert.ok(result.html.length>10000);});
test('Steam article images become lazy image references without remote markup',()=>{const result=article('[img]{STEAM_CLAN_IMAGE}/123/post.png[/img]');assert.deepEqual(result.images,['https://clan.akamai.steamstatic.com/images/123/post.png']);assert.ok(result.html.includes('data-article-image="0"'));assert.ok(!result.html.includes('https:'));});
test('article content cannot inject scripts, event handlers, frames or unsafe images',()=>{const result=article('<script>alert(1)</script><iframe src="https://evil.test"></iframe><img src="https://evil.test/a.png" onerror="alert(1)">[url=javascript:alert(1)]Link[/url][img]file:///private.png[/img]');assert.equal(result.images.length,0);assert.equal(/<script|<iframe|onerror=|javascript:|file:/.test(result.html),false);assert.ok(result.html.includes('Link'));});
test('quote marks and malformed BBCode remain inert even inside image attributes',()=>{const result=article('[img]https://clan.akamai.steamstatic.com/a.png" onerror="evil[/img]<svg onload="evil">text</svg>');assert.equal(/onerror=|onload=|<svg/.test(result.html),false);assert.ok(result.html.includes('text'));});

test('BBCode and plain web links retain destinations without merging adjacent text',()=>{
 const url='https://www.amd.com/en/resources/support-articles/release-notes/RN-RAD-WIN-26-10-1.html';
 const result=article('[url='+url+']Driver notes[/url]Please update. Visit https://store.steampowered.com/news/.');
 assert.deepEqual(result.links,[url,'https://store.steampowered.com/news/']);assert.match(result.html,/data-article-link="0"/);assert.match(result.html,/<\/a> Please update/);
});
test('HTML anchors, relative links, and query entities are preserved as safe actions',()=>{
 const result=article('<a href="/news/?a=1&amp;b=2"><b>Read more</b></a>',{baseUrl:'https://store.steampowered.com/news/app/1'});
 assert.deepEqual(result.links,['https://store.steampowered.com/news/?a=1&b=2']);assert.match(result.html,/Read more<\/a>/);assert.ok(!result.html.includes('<b>'));
});
test('HTML, linked images, and Steam image attributes all produce usable image references',()=>{
 const result=article('<a href="https://www.publisher.com/update"><img src="https://cdn.publisher.com/screen.jpg" alt="Game scene"></a>[img src="{STEAM_CLAN_IMAGE}/123/art.png"]');
 assert.deepEqual(result.images,['https://cdn.publisher.com/screen.jpg','https://clan.akamai.steamstatic.com/images/123/art.png']);assert.match(result.html,/alt="Game scene"/);assert.match(result.html,/data-article-image="1"/);assert.ok(!result.html.includes('\uE000'));
});
test('unsafe link protocols, local addresses, credentials, and event handlers are rejected',()=>{
 const {safeLink}=require('../src/news-content.cjs');for(const value of ['javascript:alert(1)','&#106;avascript:evil','file:///C:/private','steam://run/1','https://127.0.0.1/private','https://localhost/a','https://name:password@www.publisher.com/'])assert.equal(safeLink(value),null,value);
 const result=article('<a href="javascript:evil" onclick="evil">Copy</a>');assert.deepEqual(result.links,[]);assert.equal(/onclick|javascript:/.test(result.html),false);
});
test('article media and links are bounded',()=>{const result=article('[img]https://cdn.publisher.com/a.jpg[/img]'.repeat(60)+'[url=https://www.publisher.com]Link[/url]'.repeat(200));assert.equal(result.images.length,24);assert.equal(result.links.length,128);});

test('Steam list item closers produce distinct list items without visible formatting debris',()=>{
 const result=article('[h2]TLDR;[/h2]\nRead on.\n[list][*]Legend banning[/*]\n[*]Scoring adjustments[/*][*]Rewards[/*][/list]');
 assert.match(result.html,/<ul><li>Legend banning<\/li><li>Scoring adjustments<\/li><li>Rewards<\/li><\/ul>/);assert.ok(!result.html.includes('[/*]'));assert.match(result.html,/<h2>TLDR;<\/h2>/);
});
test('literal inline bullet announcements become a readable list without losing text',()=>{
 const result=article('• Platformer Saving• Custom Keybinds• Auto-Save and Auto-Backup levels• Bug fixes, tweaks and more!');
 assert.equal((result.html.match(/<li>/g)||[]).length,4);assert.ok(result.html.includes('Auto-Save and Auto-Backup levels'));assert.match(result.html,/^<ul>/);
});
test('Steam paragraph-wrapped bullet notes are separated before paragraph tags disappear',()=>{
 const result=article('[p]• Platformer Saving[/p][p]• Custom Keybinds[/p][p]• Death Tracking[/p]');
 assert.equal((result.html.match(/<li>/g)||[]).length,3);assert.equal((result.html.match(/<ul>/g)||[]).length,1);assert.ok(!result.html.includes('[p]'));assert.ok(!result.html.includes('Saving•'));
});
test('bullet separators split notes even after introductory prose or as HTML entities',()=>{
 const result=article('Changes: • First note• Second note&#8226; Third note');
 assert.equal((result.html.match(/<li>/g)||[]).length,3);assert.ok(result.html.startsWith('Changes:'));assert.match(result.html,/Third note<\/li>/);
});
test('HTML ordered and nested lists retain structure while attributes and scripts stay inert',()=>{
 const result=article('<h2>Changes</h2><ol onclick="evil"><li>First<ul><li><strong>Nested</strong></li></ul></li><li>Second<script>evil()</script></li></ol>');
 assert.match(result.html,/<h2>Changes<\/h2><ol><li>First<ul><li><strong>Nested<\/strong><\/li><\/ul><\/li><li>Second<\/li><\/ol>/);assert.equal(/onclick|script|evil\(/.test(result.html),false);
});
test('malformed lists stay bounded and keep following links and images usable',()=>{
 const result=article('[/list][/*][list=1][*]First[*][url=https://www.publisher.com/notes]Notes[/url][img]https://cdn.publisher.com/photo.png[/img]');
 assert.match(result.html,/<ol><li>First<\/li><li>/);assert.match(result.html,/<\/li><\/ol>$/);assert.equal(result.links.length,1);assert.equal(result.images.length,1);assert.ok(!/\[\/?\*\]/.test(result.html));
});
