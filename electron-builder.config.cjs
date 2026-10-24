const pkg=require('./package.json'),notes=require('./src/release-notes.json');
module.exports={...pkg.build,publish:[{provider:'generic',url:require('./src/release-config.cjs').FEED,channel:'latest'}],afterPack:require('./scripts/compact-package.cjs'),releaseInfo:{releaseName:'Orbit '+pkg.version,releaseNotes:notes.notes.map(n=>'- '+n).join('\n')}};
