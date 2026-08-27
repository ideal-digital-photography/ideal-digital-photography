const defaults = {
  photos:[
    {title:"Wedding Stories",sub:"Add your wedding photo"},
    {title:"Pre-Wedding",sub:"Add your pre-wedding photo"},
    {title:"Candid Moments",sub:"Add your favourite photo"},
    {title:"Celebrations",sub:"Add your event photo"},
    {title:"Portraits",sub:"Add your portrait"},
    {title:"Beautiful Memories",sub:"Add another photo"}
  ],
  packages:[
    {name:"Silver",price:"Add Price",desc:"Perfect for intimate celebrations.",items:["Wedding coverage","Candid photography","Edited digital photos"]},
    {name:"Gold",price:"Add Price",desc:"A complete wedding photography experience.",items:["Full-day coverage","Candid + traditional","Premium edited photos","Online gallery"]},
    {name:"Premium",price:"Add Price",desc:"For couples who want the complete story.",items:["Multi-day coverage","Candid + cinematic","Premium album","Pre-wedding session"]}
  ]
};
function load(key){try{return JSON.parse(localStorage.getItem("ideal_"+key))||defaults[key]}catch(e){return defaults[key]}}
function save(key,val){localStorage.setItem("ideal_"+key,JSON.stringify(val))}
function render(){
 const photos=load("photos"), pkgs=load("packages");
 document.getElementById("galleryGrid").innerHTML=photos.map((p,i)=>`<div class="photo" style="${p.image?`background-image:url('${p.image}');background-size:cover;background-position:center`:''}"><span>${p.title}<small style="display:block;letter-spacing:1px;margin-top:5px">${p.sub||''}</small></span></div>`).join("");
 document.getElementById("packageGrid").innerHTML=pkgs.map((p,i)=>`<article class="package ${i===1?'featured':''}"><span class="eyebrow">PACKAGE ${String(i+1).padStart(2,'0')}</span><h3>${p.name}</h3><div class="price">${p.price}</div><p>${p.desc}</p><ul>${(p.items||[]).map(x=>`<li>${x}</li>`).join("")}</ul><a class="btn ${i===1?'primary':'ghost'}" href="#booking">Enquire Now</a></article>`).join("");
}
function showAdmin(tab,btn){
 document.querySelectorAll(".admin-tabs button").forEach(x=>x.classList.remove("active")); if(btn)btn.classList.add("active");
 const c=document.getElementById("adminContent");
 if(tab==="photos"){
  const data=load("photos");
  c.innerHTML=`<p class="mini">Tip: To use a real photo, choose an image below. It is stored in this browser for this starter version.</p>
  <input class="file-input" type="file" accept="image/*" id="photoFile">
  <input id="photoTitle" placeholder="Photo title"><input id="photoSub" placeholder="Short caption">
  <button class="btn primary" onclick="addPhoto()">Add Photo</button>
  <div>${data.map((p,i)=>`<div class="admin-row"><div><b>${p.title}</b><div class="mini">${p.sub||''}</div></div><div class="admin-actions"><button onclick="editPhoto(${i})">Edit</button><button onclick="deletePhoto(${i})">Delete</button></div></div>`).join("")}</div>`;
 } else if(tab==="packages"){
  const data=load("packages");
  c.innerHTML=`<button class="btn primary" onclick="addPackage()">+ Add Package</button><div>${data.map((p,i)=>`<div class="admin-row"><div><b>${p.name} — ${p.price}</b><div class="mini">${p.desc}</div></div><div class="admin-actions"><button onclick="editPackage(${i})">Edit</button><button onclick="deletePackage(${i})">Delete</button></div></div>`).join("")}</div>`;
 } else {
  const b=JSON.parse(localStorage.getItem("ideal_bookings")||"[]");
  c.innerHTML=b.length?b.map((x,i)=>`<div class="booking-item"><b>${x.name} — ${x.event}</b>${x.phone} • ${x.email||"No email"}<br>Date: ${x.date||"—"} ${x.time||""}<br>${x.message||""}<br><button onclick="deleteBooking(${i})">Delete</button></div>`).join(""):"<p>No appointment requests yet.</p>";
 }
}
function addPhoto(){
 const f=document.getElementById("photoFile").files[0], title=document.getElementById("photoTitle").value||"My Photo", sub=document.getElementById("photoSub").value||"Photography";
 if(!f){alert("Please choose an image.");return}
 const r=new FileReader(); r.onload=()=>{let d=load("photos");d.push({title,sub,image:r.result});save("photos",d);render();showAdmin("photos");};r.readAsDataURL(f)
}
function deletePhoto(i){let d=load("photos");d.splice(i,1);save("photos",d);render();showAdmin("photos")}
function editPhoto(i){let d=load("photos"),p=d[i];let t=prompt("Photo title:",p.title);if(t!==null){p.title=t;p.sub=prompt("Caption:",p.sub)||p.sub;save("photos",d);render();showAdmin("photos")}}
function addPackage(){let d=load("packages");d.push({name:"New Package",price:"Add Price",desc:"Package description",items:["Add service"]});save("packages",d);render();showAdmin("packages")}
function editPackage(i){let d=load("packages"),p=d[i];p.name=prompt("Package name:",p.name)||p.name;p.price=prompt("Price:",p.price)||p.price;p.desc=prompt("Description:",p.desc)||p.desc;p.items=(prompt("Included items (comma separated):",p.items.join(", "))||p.items.join(", ")).split(",").map(x=>x.trim()).filter(Boolean);save("packages",d);render();showAdmin("packages")}
function deletePackage(i){let d=load("packages");d.splice(i,1);save("packages",d);render();showAdmin("packages")}
function deleteBooking(i){let b=JSON.parse(localStorage.getItem("ideal_bookings")||"[]");b.splice(i,1);localStorage.setItem("ideal_bookings",JSON.stringify(b));showAdmin("bookings")}
document.getElementById("bookingForm").addEventListener("submit",e=>{e.preventDefault();let x=Object.fromEntries(new FormData(e.target).entries());let b=JSON.parse(localStorage.getItem("ideal_bookings")||"[]");b.push({...x,created:new Date().toISOString()});localStorage.setItem("ideal_bookings",JSON.stringify(b));document.getElementById("bookingMsg").textContent="Thank you! Your appointment request has been saved. We will contact you soon.";e.target.reset()});
document.getElementById("year").textContent=new Date().getFullYear(); render();
if(location.hash==="#admin")showAdmin("photos",document.querySelector(".admin-tabs button"));
