import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sources,findSource} from '../src/sources.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

test('fontes possuem chaves unicas e URLs CSV publicas',()=>{
  assert.equal(sources.length,27);
  assert.equal(new Set(sources.map(source=>source.key)).size,sources.length);
  for(const source of sources){
    assert.match(source.key,/^[a-z0-9-]+$/);
    assert.match(source.url,/^https:\/\/docs\.google\.com\/spreadsheets\//);
    assert.match(source.url,/output=csv/);
  }
});

test('localiza uma fonte conhecida',()=>{
  assert.equal(findSource('aet')?.name,'Gestao de AETs');
  assert.equal(findSource('inexistente'),undefined);
});

test('cadastro SQL acompanha todas as URLs do painel',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const source of sources)assert.ok(html.includes(source.url),`URL ausente no painel: ${source.key}`);
});

test('painel permanece em Google Sheets ate a homologacao',()=>{
  const config=fs.readFileSync(path.join(root,'config.js'),'utf8');
  assert.match(config,/mode:'sheets'/);
});
