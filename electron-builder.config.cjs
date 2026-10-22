const pkg=require('./package.json'),notes=require('./src/release-notes.json');
module.exports={...pkg.build,afterPack:require('./scripts/compact-package.cjs'),releaseInfo:{releaseName:'Orbit '+pkg.version,releaseNotes:notes.notes.map(n=>'- '+n).join('\n')}};
