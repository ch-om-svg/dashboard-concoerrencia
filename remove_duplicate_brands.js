const fs = require('fs');

// 1. Update data/brands_deep_data.js
let deepContent = fs.readFileSync('data/brands_deep_data.js', 'utf8');
const brands = eval(deepContent + '; BRANDS_DEEP_DATA');
const idsToRemove = ['redwing_shoes', 'redwing_acc', 'nicks_leather'];

const filteredBrands = brands.filter(b => !idsToRemove.includes(b.id));
console.log('Filtered brands_deep_data from', brands.length, 'to', filteredBrands.length);

const newDeepJs = 'const BRANDS_DEEP_DATA = ' + JSON.stringify(filteredBrands, null, 2) + ';\n\nif (typeof window !== "undefined") {\n  window.BRANDS_DEEP_DATA = BRANDS_DEEP_DATA;\n}\n';
fs.writeFileSync('data/brands_deep_data.js', newDeepJs, 'utf8');
console.log('Successfully updated data/brands_deep_data.js');

// 2. Update data/real_ig_posts.js
let postsContent = fs.readFileSync('data/real_ig_posts.js', 'utf8');
let postObj = eval(postsContent + '; REAL_IG_POSTS');
idsToRemove.forEach(id => {
  if (postObj[id]) {
    delete postObj[id];
    console.log('Deleted postObj entry for:', id);
  }
});
const newPostsJs = 'const REAL_IG_POSTS = ' + JSON.stringify(postObj, null, 2) + ';\n\nif (typeof window !== "undefined") {\n  window.REAL_IG_POSTS = REAL_IG_POSTS;\n}\n';
fs.writeFileSync('data/real_ig_posts.js', newPostsJs, 'utf8');
console.log('Successfully updated data/real_ig_posts.js');

// 3. Update index.html counts
let indexHtml = fs.readFileSync('index.html', 'utf8');

indexHtml = indexHtml.replace(/91 Marcas/g, '88 Marcas');
indexHtml = indexHtml.replace(/91 concorrentes/g, '88 concorrentes');
indexHtml = indexHtml.replace(/Todas as Secções \(91\)/g, 'Todas as Secções (88)');
indexHtml = indexHtml.replace(/Sapatos \(31\)/g, 'Sapatos (30)');
indexHtml = indexHtml.replace(/31 Marcas Empilhadas/g, '30 Marcas Empilhadas');
indexHtml = indexHtml.replace(/SECÇÃO 1: SAPATOS \(31 MARCAS\)/g, 'SECÇÃO 1: SAPATOS (30 MARCAS)');
indexHtml = indexHtml.replace(/SECÇÃO 3: MALAS \(30 MARCAS\)/g, 'SECÇÃO 3: MALAS (28 MARCAS)');
indexHtml = indexHtml.replace(/Malas \(30\)/g, 'Malas (28)');

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('Successfully updated index.html with new counts!');
