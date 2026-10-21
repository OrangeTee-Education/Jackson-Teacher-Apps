(function(root){
'use strict';
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const rat=(n,d=1)=>{const g=gcd(n,d);return {n:n/g,d:d/g};};
const value=x=>rat(x.w*x.d+x.n,x.d);
const fmt=x=>{const w=Math.floor(x.n/x.d),n=x.n%x.d;return n?(w?`${w} ${n}/${x.d}`:`${n}/${x.d}`):String(w);};
const raw=x=>`${x.w?x.w+' ':''}${x.n}/${x.d}`;
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const topics=[];
for(const mixed of [false,true]){
 for(const op of ['+','−']) for(const like of [true,false]) for(const regroup of mixed?[false,true]:[null]) topics.push({id:`${mixed?'m':'f'}${op==='+'?'a':'s'}${like?'l':'u'}${regroup===null?'':regroup?'r':'n'}`,group:mixed?'Mixed numbers':'Fractions',op,like,regroup,mixed,label:`${op==='+'?'Addition':'Subtraction'} · ${like?'like':'unlike'} denominators${mixed?` · ${regroup?'regrouping':'no regrouping'}`:''}`});
 for(const op of ['×','÷'])topics.push({id:`${mixed?'m':'f'}${op==='×'?'mul':'div'}`,group:mixed?'Mixed numbers':'Fractions',op,mixed,label:op==='×'?'Multiplication':'Division'});
}
for(const op of ['÷','×'])for(const wholeFirst of [false,true])topics.push({id:`w${op==='÷'?'d':'m'}${wholeFirst?'first':'last'}`,group:'Fractions & whole numbers',op,wholeFirst,label:`${wholeFirst?'Whole number':'Fraction'} ${op} ${wholeFirst?'fraction':'whole number'}`});
function generate(t){
 let a,b;
 for(let tries=0;tries<10000;tries++){
  const d=rnd(2,12), e=t.like?d:rnd(2,12);
  if(t.like===false&&d===e)continue;
  a={w:t.mixed?rnd(1,5):0,n:rnd(1,d-1),d};b={w:t.mixed?rnd(1,5):0,n:rnd(1,e-1),d:e};
  if(t.group==='Fractions & whole numbers'){
   const whole={w:0,n:rnd(2,9),d:1};if(t.wholeFirst)a=whole;else b=whole;
  }
  if(t.op==='−'&&value(a).n*value(b).d<value(b).n*value(a).d)continue;
  if(t.mixed&&(t.op==='+'||t.op==='−')){
   const needs=t.op==='+'?a.n*b.d+b.n*a.d>=a.d*b.d:a.n*b.d<b.n*a.d;
   if(needs!==t.regroup)continue;
  }
  break;
 }
 const av=value(a),bv=value(b);
 const answer=t.op==='+'?rat(av.n*bv.d+bv.n*av.d,av.d*bv.d):t.op==='−'?rat(av.n*bv.d-bv.n*av.d,av.d*bv.d):t.op==='×'?rat(av.n*bv.n,av.d*bv.d):rat(av.n*bv.d,av.d*bv.n);
 return {t,a,b,answer};
}
function parse(s){
 s=s.trim().replace(/[⁄∕]/g,'/');let m;
 if((m=s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/))){const [w,n,d]=m.slice(1).map(Number);if(!d||[w,n,d].some(x=>!Number.isSafeInteger(x)||x>1000000))return null;return rat(w*d+n,d);}
 if((m=s.match(/^(\d+)\s*\/\s*(\d+)$/))){const n=Number(m[1]),d=Number(m[2]);return d&&n<=1000000&&d<=1000000?rat(n,d):null;}
 if(/^\d+(\.\d{1,6})?$/.test(s)){const parts=s.split('.'),d=10**(parts[1]?.length||0),n=Number(parts.join(''));return Number.isSafeInteger(n)&&n<=1000000000000?rat(n,d):null;}
 return null;
}
function hints(p){
 const {a,b,t,answer}=p,av=value(a),bv=value(b),steps=[];
 if(t.op==='+'||t.op==='−'){
  const l=a.d*b.d/gcd(a.d,b.d),an=a.n*l/a.d,bn=b.n*l/b.d;
  steps.push(t.like?`The denominators already match. Keep ${l} as the denominator.`:`Find a shared denominator: ${l}. Rewrite the fraction parts: ${a.n}/${a.d} = ${an}/${l} and ${b.n}/${b.d} = ${bn}/${l}.`);
  if(t.mixed){
   if(t.op==='−'&&t.regroup)steps.push(`You need to borrow 1 whole from ${a.w}. Now ${raw(a)} becomes ${a.w-1} ${an+l}/${l}. Subtract ${b.w} ${bn}/${l}.`);
   else if(t.op==='+'&&t.regroup)steps.push(`Add the wholes: ${a.w} + ${b.w} = ${a.w+b.w}. Add the fraction parts: ${an}/${l} + ${bn}/${l} = ${an+bn}/${l}. That makes ${Math.floor((an+bn)/l)} extra whole; carry it to the whole-number part.`);
   else steps.push(`Work in two parts. Wholes: ${a.w} ${t.op} ${b.w} = ${t.op==='+'?a.w+b.w:a.w-b.w}. Numerators: ${an} ${t.op} ${bn} = ${t.op==='+'?an+bn:an-bn}. Keep denominator ${l}.`);
  }else steps.push(`Add or subtract only the numerators: ${an} ${t.op} ${bn} = ${t.op==='+'?an+bn:an-bn}. Keep denominator ${l}.`);
 }else{
  steps.push(`Write each number as a fraction${t.mixed?' (whole × denominator + numerator)':''}: ${av.n}/${av.d} ${t.op} ${bv.n}/${bv.d}.`);
  if(t.op==='÷')steps.push(`Keep the first fraction, change ÷ to ×, and flip the second fraction: ${av.n}/${av.d} × ${bv.d}/${bv.n}.`);
  const n=av.n*(t.op==='÷'?bv.d:bv.n),d=av.d*(t.op==='÷'?bv.n:bv.d);
  steps.push(`Multiply across: top × top and bottom × bottom. You get ${n}/${d}. Then simplify.`);
 }
 steps.push(`Simplify by dividing the numerator and denominator by the same factor. If the top is at least the bottom, you can make a mixed number. The answer is ${fmt(answer)}.`);
 return steps;
}
const api={topics,gcd,rat,value,fmt,raw,generate,parse,hints};if(typeof module!=='undefined')module.exports=api;root.FractionMath=api;
})(typeof window!=='undefined'?window:globalThis);
