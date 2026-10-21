const assert=require('node:assert/strict');
const M=require('./math.js');assert.equal(M.topics.length,20);assert.equal(new Set(M.topics.map(t=>t.id)).size,20);
for(const t of M.topics)for(let i=0;i<1000;i++){
 const p=M.generate(t),{a,b,answer}=p;
 if(t.like!==undefined)assert.equal(a.d===b.d,t.like);
 if(t.mixed){assert(a.w>0&&b.w>0);if(t.regroup!==undefined){const needs=t.op==='+'?a.n*b.d+b.n*a.d>=a.d*b.d:a.n*b.d<b.n*a.d;assert.equal(needs,t.regroup);}}
 const x=a.w+a.n/a.d,y=b.w+b.n/b.d,expected=t.op==='+'?x+y:t.op==='−'?x-y:t.op==='×'?x*y:x/y;assert(Math.abs(answer.n/answer.d-expected)<1e-10);assert(answer.n>=0);assert.equal(M.gcd(answer.n,answer.d),1);
 const parsed=M.parse(M.fmt(answer));assert.equal(parsed.n*answer.d,answer.n*parsed.d);assert(M.hints(p).length>=3);
 if(t.wholeFirst!==undefined){assert.equal((t.wholeFirst?a:b).d,1);assert.equal((t.wholeFirst?b:a).w,0);}
}
for(const s of ['1/0','-1','1/2/3','hello','1e2','Infinity','2 3/0',''])assert.equal(M.parse(s),null);
assert.deepEqual(M.parse('2/4'),M.parse('0.5'));assert.deepEqual(M.parse('1 1/2'),M.parse('3/2'));assert.deepEqual(M.parse('0/7'),M.parse('0'));
console.log('Passed: 20,000 generated problems across all 20 topics; operation results, regrouping, denominator rules, parsing, equivalence, and hints.');
