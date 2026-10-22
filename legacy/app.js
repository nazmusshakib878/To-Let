var AREAS=["সোনাডাঙ্গা","বয়রা","খালিশপুর","দৌলতপুর","শিরোমনি","সাতক্ষীরা সদর"];
function ph(c){var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 190"><rect width="240" height="190" fill="'+c+'"/><rect y="140" width="240" height="50" fill="rgba(0,0,0,.12)"/><rect x="150" y="30" width="60" height="70" rx="4" fill="rgba(255,255,255,.7)"/><path d="M180 30v70M150 65h60" stroke="'+c+'" stroke-width="3"/><rect x="26" y="96" width="100" height="44" rx="6" fill="rgba(255,255,255,.85)"/><rect x="26" y="84" width="30" height="20" rx="5" fill="rgba(255,255,255,1)"/></svg>';return"data:image/svg+xml;utf8,"+encodeURIComponent(s)}
var SEED=[
{id:1,name:"আব্দুল করিম",phone:"01711000001",loc:"সোনাডাঙ্গা",addr:"সোনাডাঙ্গা বাস স্ট্যান্ড সংলগ্ন, মসজিদ রোড",rent:2800,rooms:2,floor:2,max:5,type:"family",rules:["গ্যাস ও পানির বিল আলাদা","রাত ১০টায় গেট বন্ধ","১ মাসের অগ্রিম"],c:"#7fb5a0"},
{id:2,name:"শফিকুল ইসলাম",phone:"01811000002",loc:"বয়রা",addr:"বয়রা বাজার থেকে ৫ মিনিট",rent:3000,rooms:2,floor:2,max:4,type:"family",rules:["পোষা প্রাণী নিষেধ","বিদ্যুৎ বিল মিটার অনুযায়ী"],c:"#e0b36a"},
{id:3,name:"মিসেস রহিমা",phone:"01911000003",loc:"সোনাডাঙ্গা",addr:"নিউ মার্কেট গলি, ৩য় বাড়ি",rent:2500,rooms:1,floor:1,max:3,type:"any",rules:["ধূমপান নিষেধ","২ মাসের অগ্রিম"],c:"#8fa8d6"},
{id:4,name:"জাহাঙ্গীর আলম",phone:"01611000004",loc:"খালিশপুর",addr:"খালিশপুর ১ নং গেট",rent:3500,rooms:3,floor:3,max:7,type:"family",rules:["লিফট নেই","পার্কিং আছে (বাইক)"],c:"#c99aa5"},
{id:5,name:"মো. সাইফুল",phone:"01511000005",loc:"বয়রা",addr:"বয়রা মেইন রোড, ব্যাংকের পাশে",rent:2900,rooms:2,floor:2,max:5,type:"family",rules:["গ্যাস লাইন আছে","সন্ধ্যার পর অতিথি সীমিত"],c:"#a3c48a"},
{id:6,name:"নুরুল হক",phone:"01311000006",loc:"সাতক্ষীরা সদর",addr:"কলেজ রোড",rent:2000,rooms:1,floor:1,max:2,type:"bachelor",rules:["ছাত্রদের জন্য","রাত ১১টায় গেট বন্ধ"],c:"#b79bd1"}];
var L=SEED.slice();
try{var s=localStorage.getItem("tolet-v1");if(s){var p=JSON.parse(s);if(Array.isArray(p))L=p}}catch(e){}
function save(){try{localStorage.setItem("tolet-v1",JSON.stringify(L))}catch(e){}}
var $=function(i){return document.getElementById(i)};
function esc(t){return String(t).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})}
function bn(n){return String(n).replace(/\d/g,function(d){return"০১২৩৪৫৬৭৮৯"[d]})}
var TYPE={family:"ফ্যামিলি",bachelor:"ব্যাচেলর",any:"যে কেউ"};
function fill(id,first){var h=first?'<option value="">সব এলাকা</option>':"";AREAS.forEach(function(a){h+="<option>"+a+"</option>"});$(id).innerHTML=h}
fill("fLoc",true);fill("pLoc",false);

// Replace this function with a real API call (fetch) later.
function searchListings(q){
 return L.filter(function(x){
  if(q.loc&&x.loc!==q.loc)return false;
  if(q.rent&&x.rent>q.rent)return false;
  if(q.rooms&&x.rooms<q.rooms)return false;
  if(q.floor&&x.floor!==q.floor)return false;
  if(q.mem&&x.max<q.mem)return false;
  if(q.type&&x.type!=="any"&&x.type!==q.type)return false;
  return true}).sort(function(a,b){return q.sort==="new"?b.id-a.id:a.rent-b.rent});
}
function card(x){
 var img=x.photo||ph(x.c||"#7fb5a0");
 return '<article class="card"><img src="'+img+'" alt="রুমের ছবি" loading="lazy"><div class="body">'
 +'<div class="price">৳'+bn(x.rent.toLocaleString("en-US"))+' <small>/ মাস</small></div>'
 +'<p class="loc">'+esc(x.loc)+'</p><p class="addr">'+esc(x.addr)+'</p>'
 +'<div class="tags"><span class="tag">'+bn(x.rooms)+' রুম</span><span class="tag">'+bn(x.floor)+' তলা</span><span class="tag">সর্বোচ্চ '+bn(x.max)+' জন</span><span class="tag y">'+TYPE[x.type]+'</span></div>'
 +'<ul class="rules">'+x.rules.map(function(r){return"<li>"+esc(r)+"</li>"}).join("")+'</ul>'
 +'<a class="call" href="tel:'+esc(x.phone)+'">কল করুন '+esc(x.phone)+'</a><button class="cp" data-p="'+esc(x.phone)+'">নম্বর কপি</button><span class="owner">'+esc(x.name)+'</span>'+(x.mine?'<div><button class="del" data-id="'+x.id+'">আমার পোস্ট মুছুন</button></div>':'')+'</div></article>';
}
function run(){
 var q={sort:$("sort").value,loc:$("fLoc").value,rent:+$("fRent").value||0,rooms:+$("fRooms").value,floor:+$("fFloor").value||0,mem:+$("fMem").value||0,type:$("fType").value};
 var r=searchListings(q);
 $("count").textContent=r.length?bn(r.length)+"টি বাসা পাওয়া গেছে":"";
 $("list").innerHTML=r.length?r.map(card).join(""):'<div class="empty">মিলছে এমন কোনো বাসা নেই।<br>ভাড়ার সীমা বাড়ান বা তলা ও রুমের ফিল্টার “যেকোনো” করুন।</div>';
}
$("go").onclick=run;$("sort").onchange=run;
$("list").onclick=function(e){
 var d=e.target.closest(".del"),c=e.target.closest(".cp");
 if(d){L=L.filter(function(x){return String(x.id)!==d.dataset.id});save();run();toast("পোস্ট মুছে ফেলা হয়েছে")}
 else if(c){try{navigator.clipboard.writeText(c.dataset.p).then(function(){toast("নম্বর কপি হয়েছে")},function(){toast(c.dataset.p)})}catch(x){toast(c.dataset.p)}}
};
$("reset").onclick=function(){$("fLoc").value="";$("fRent").value="";$("fRooms").value="0";$("fFloor").value="";$("fMem").value="";$("fType").value="";run()};
function tab(n){$("find").classList.toggle("hide",n!==1);$("post").classList.toggle("hide",n!==2);$("t1").setAttribute("aria-selected",n===1);$("t2").setAttribute("aria-selected",n===2)}
$("t1").onclick=function(){tab(1)};$("t2").onclick=function(){tab(2)};
function toast(m){var t=$("toast");t.textContent=m;t.classList.remove("hide");setTimeout(function(){t.classList.add("hide")},2400)}
var photo="";
$("pPhoto").onchange=function(e){
 var f=e.target.files[0];if(!f)return;
 var r=new FileReader();
 r.onload=function(){var im=new Image();im.onload=function(){
  var m=800,s=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement("canvas");
  c.width=im.width*s;c.height=im.height*s;c.getContext("2d").drawImage(im,0,0,c.width,c.height);
  photo=c.toDataURL("image/jpeg",.7);$("prev").src=photo;$("prev").classList.remove("hide")};im.onerror=function(){toast("এটি ছবি নয়, অন্য ফাইল দিন")};im.src=r.result};
 r.readAsDataURL(f);
};
$("submit").onclick=function(){
 var n=$("pName").value.trim(),p=$("pPhone").value.trim(),rent=+$("pRent").value;
 var bad=[["pName",!n],["pPhone",!/^(\+?88)?01[3-9]\d{8}$/.test(p.replace(/[\s-]/g,""))],["pRent",!(rent>=500)]];
 bad.forEach(function(b){$(b[0]).setAttribute("aria-invalid",b[1])});
 var first=bad.filter(function(b){return b[1]})[0];
 if(first){$(first[0]).focus();toast(first[0]==="pPhone"?"ফোন নম্বর ১১ সংখ্যার হতে হবে, যেমন 01712345678":"নাম এবং ভাড়া (কমপক্ষে ৫০০ ৳) দিন");return}
 L.unshift({id:Date.now(),name:n,phone:p,loc:$("pLoc").value,addr:$("pAddr").value.trim()||$("pLoc").value,rent:rent,rooms:+$("pRooms").value||1,floor:+$("pFloor").value||1,max:+$("pMax").value||1,type:$("pType").value,rules:$("pRules").value.split("\n").map(function(s){return s.trim()}).filter(Boolean),photo:photo,c:"#7fb5a0",mine:true});
 save();photo="";$("prev").classList.add("hide");
 ["pName","pPhone","pAddr","pRent","pRules","pPhoto"].forEach(function(i){$(i).value=""});
 toast("পোস্ট হয়েছে");$("reset").click();tab(1);
};
run();
