import assert from 'node:assert/strict';
import {initialQuotes,appendRevision,quoteTotal,validateRevision,revisionPrice} from '../apps/admin/src/quote-model.ts';
const quote=structuredClone(initialQuotes[0]),snapshot=JSON.stringify(quote),revision=structuredClone(quote.revisions[0]);
revision.lines[0].quantity=25;revision.lines[0].unitCents=revisionPrice('100,05');
assert.equal(quoteTotal(revision),250125);const result=appendRevision(quote,1,revision);assert.equal(result.quote.revisions.length,2);assert.equal(result.quote.revisions[1].number,2);assert.equal(JSON.stringify(quote),snapshot);
revision.lines[0].quantity=1;assert.equal(result.quote.revisions[1].lines[0].quantity,25);
assert.ok(appendRevision(result.quote,1,revision).error);
for(const quantity of [0,-1,1.5,10001,NaN]){const r=structuredClone(quote.revisions[0]);r.lines[0].quantity=quantity;assert.ok(validateRevision(r));}
assert.ok(validateRevision({...revision,lines:[]}));assert.ok(validateRevision({...revision,validUntil:'2026-02-30'}));assert.ok(validateRevision({...revision,note:''}));assert.ok(validateRevision({...revision,delivery:''}));assert.ok(Number.isNaN(revisionPrice('1.234')));
console.log('quote model: immutable revisions, cents total, conflict, date/line/reason validation = OK');
