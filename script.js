// IDEAL DIGITAL PHOTOGRAPHY
// Firebase + Website Admin
// Appointments and Packages are stored in Firestore.

const firebaseConfig = {
  apiKey: "#JAID765399",
  authDomain: "ideal-digital-photography.firebaseapp.com",
  projectId: "ideal-digital-photography",
  storageBucket: "ideal-digital-photography.firebasestorage.app",
  messagingSenderId: "228277011843",
  appId: "1:228277011843:web:af7d2b1d064adb38ea2b6"
};

const defaults = {
  photos: [
    {title:"Wedding Stories",sub:"Add your wedding photo"},
    {title:"Pre-Wedding",sub:"Add your pre-wedding photo"},
    {title:"Candid Moments",sub:"Add your favourite photo"},
    {title:"Celebrations",sub:"Add your event photo"},
    {title:"Portraits",sub:"Add your portrait"},
    {title:"Beautiful Memories",sub:"Add another photo"}
  ],

  packages: [
    {
      name:"Silver",
      price:"Add Price",
      desc:"Perfect for intimate celebrations.",
      items:["Wedding coverage","Candid photography","Edited digital photos"]
    },
    {
      name:"Gold",
      price:"Add Price",
      desc:"A complete wedding photography experience.",
      items:["Full-day coverage","Candid + traditional","Premium edited photos","Online gallery"]
    },
    {
      name:"Premium",
      price:"Add Price",
      desc:"For couples who want the complete story.",
      items:["Multi-day coverage","Candid + cinematic","Premium album","Pre-wedding session"]
    }
  ]
};

let db = null;
let firebaseReady = false;

async function startFirebase() {
  try {
    const appModule = await import(
      "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js"
    );

    const firestoreModule = await import(
      "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
    );

    const app = appModule.initializeApp(firebaseConfig);

    db = firestoreModule.getFirestore(app);

    window.firebaseFirestore = firestoreModule;

    firebaseReady = true;

    console.log("Firebase connected successfully.");

    await loadPackagesFromFirebase();

  } catch (error) {
    console.error("Firebase connection error:", error);
    firebaseReady = false;
    render();
  }
}


/* -------------------------
   LOCAL FALLBACK
------------------------- */

function localLoad(key) {
  try {
    return JSON.parse(localStorage.getItem("ideal_" + key)) || defaults[key];
  } catch (e) {
    return defaults[key];
  }
}

function localSave(key, value) {
  localStorage.setItem("ideal_" + key, JSON.stringify(value));
}


/* -------------------------
   RENDER WEBSITE
------------------------- */

function render() {

  const photos = localLoad("photos");
  const packages = localLoad("packages");

  const gallery = document.getElementById("galleryGrid");
  const packageGrid = document.getElementById("packageGrid");

  if (gallery) {
    gallery.innerHTML = photos.map((p) => `
      <div class="photo"
        style="${p.image
          ? `background-image:url('${p.image}');background-size:cover;background-position:center`
          : ""
        }">

        <span>
          ${escapeHTML(p.title)}

          <small style="
            display:block;
            letter-spacing:1px;
            margin-top:5px;
          ">
            ${escapeHTML(p.sub || "")}
          </small>

        </span>
      </div>
    `).join("");
  }

  if (packageGrid) {

    packageGrid.innerHTML = packages.map((p,i) => `

      <article class="package ${i === 1 ? "featured" : ""}">

        <span class="eyebrow">
          PACKAGE ${String(i + 1).padStart(2,"0")}
        </span>

        <h3>${escapeHTML(p.name)}</h3>

        <div class="price">
          ${escapeHTML(p.price)}
        </div>

        <p>
          ${escapeHTML(p.desc)}
        </p>

        <ul>
          ${(p.items || []).map(item => `
            <li>${escapeHTML(item)}</li>
          `).join("")}
        </ul>

        <a
          class="btn ${i === 1 ? "primary" : "ghost"}"
          href="#booking">
          Enquire Now
        </a>

      </article>

    `).join("");
  }
}


/* -------------------------
   FIRESTORE PACKAGES
------------------------- */

async function loadPackagesFromFirebase() {

  if (!firebaseReady || !db) {
    render();
    return;
  }

  try {

    const {collection, getDocs} = window.firebaseFirestore;

    const snapshot = await getDocs(
      collection(db, "packages")
    );

    if (!snapshot.empty) {

      const packages = [];

      snapshot.forEach(doc => {

        const data = doc.data();

        packages.push({
          id: doc.id,
          name: data.name || "Package",
          price: data.price || "Contact us",
          desc: data.details || data.desc || "",
          items: data.items || []
        });

      });

      localSave("packages", packages);
    }

  } catch (error) {

    console.error(
      "Packages could not be loaded:",
      error
    );

  }

  render();
}


/* -------------------------
   ADMIN
------------------------- */

window.showAdmin = async function(tab, btn) {

  document
    .querySelectorAll(".admin-tabs button")
    .forEach(x => x.classList.remove("active"));

  if (btn) {
    btn.classList.add("active");
  }

  const content =
    document.getElementById("adminContent");

  if (!content) return;


  /* PHOTOS */

  if (tab === "photos") {

    const data = localLoad("photos");

    content.innerHTML = `

      <p class="mini">
        Add your photography images here.
      </p>

      <input
        class="file-input"
        type="file"
        accept="image/*"
        id="photoFile">

      <input
        id="photoTitle"
        placeholder="Photo title">

      <input
        id="photoSub"
        placeholder="Short caption">

      <button
        class="btn primary"
        onclick="addPhoto()">
        Add Photo
      </button>

      <div>

        ${data.map((p,i) => `

          <div class="admin-row">

            <div>
              <b>${escapeHTML(p.title)}</b>

              <div class="mini">
                ${escapeHTML(p.sub || "")}
              </div>
            </div>

            <div class="admin-actions">

              <button onclick="editPhoto(${i})">
                Edit
              </button>

              <button onclick="deletePhoto(${i})">
                Delete
              </button>

            </div>

          </div>

        `).join("")}

      </div>
    `;

    return;
  }


  /* PACKAGES */

  if (tab === "packages") {

    const data = localLoad("packages");

    content.innerHTML = `

      <button
        class="btn primary"
        onclick="addPackage()">
        + Add Package
      </button>

      <div>

        ${data.map((p,i) => `

          <div class="admin-row">

            <div>

              <b>
                ${escapeHTML(p.name)}
                —
                ${escapeHTML(p.price)}
              </b>

              <div class="mini">
                ${escapeHTML(p.desc)}
              </div>

            </div>

            <div class="admin-actions">

              <button onclick="editPackage(${i})">
                Edit
              </button>

              <button onclick="deletePackage(${i})">
                Delete
              </button>

            </div>

          </div>

        `).join("")}

      </div>
    `;

    return;
  }


  /* BOOKINGS */

  if (tab === "bookings") {

    let bookings = [];

    if (firebaseReady && db) {

      try {

        const {
          collection,
          getDocs,
          orderBy,
          query
        } = window.firebaseFirestore;

        const q = query(
          collection(db, "appointments"),
          orderBy("created", "desc")
        );

        const snapshot = await getDocs(q);

        snapshot.forEach(doc => {

          bookings.push({
            id: doc.id,
            ...doc.data()
          });

        });

      } catch (error) {

        console.error(
          "Appointments loading error:",
          error
        );

      }

    }


    if (!bookings.length) {

      bookings = JSON.parse(
        localStorage.getItem("ideal_bookings") || "[]"
      );

    }


    content.innerHTML = bookings.length

      ? bookings.map((x,i) => `

        <div class="booking-item">

          <b>
            ${escapeHTML(x.name || "")}
            —
            ${escapeHTML(x.event || x.service || "")}
          </b>

          <br>

          📞 ${escapeHTML(x.phone || "")}

          <br>

          ✉️ ${escapeHTML(x.email || "No email")}

          <br>

          📅 Date:
          ${escapeHTML(x.date || "—")}

          ${x.time
            ? " " + escapeHTML(x.time)
            : ""}

          <br>

          ${escapeHTML(x.message || "")}

          ${
            x.id
              ? `<br>
                 <button
                   onclick="deleteFirebaseBooking('${x.id}')">
                   Delete
                 </button>`
              : ""
          }

        </div>

      `).join("")

      : "<p>No appointment requests yet.</p>";

  }

};


/* -------------------------
   ADD PHOTO
------------------------- */

window.addPhoto = function() {

  const file =
    document.getElementById("photoFile").files[0];

  const title =
    document.getElementById("photoTitle").value ||
    "My Photo";

  const sub =
    document.getElementById("photoSub").value ||
    "Photography";


  if (!file) {

    alert("Please choose an image.");

    return;
  }


  const reader = new FileReader();

  reader.onload = function() {

    const photos = localLoad("photos");

    photos.push({
      title,
      sub,
      image: reader.result
    });

    localSave("photos", photos);

    render();

    showAdmin(
      "photos",
      document.querySelector(".admin-tabs button")
    );

  };

  reader.readAsDataURL(file);

};


/* -------------------------
   EDIT PHOTO
------------------------- */

window.editPhoto = function(i) {

  const data = localLoad("photos");

  const photo = data[i];

  const title =
    prompt(
      "Photo title:",
      photo.title
    );

  if (title !== null) {

    photo.title = title;

    photo.sub =
      prompt(
        "Caption:",
        photo.sub || ""
      ) || photo.sub;

    localSave("photos", data);

    render();

    showAdmin(
      "photos",
      document.querySelector(".admin-tabs button")
    );

  }

};


/* -------------------------
   DELETE PHOTO
------------------------- */

window.deletePhoto = function(i) {

  const data = localLoad("photos");

  if (!confirm("Delete this photo?")) {
    return;
  }

  data.splice(i,1);

  localSave("photos", data);

  render();

  showAdmin(
    "photos",
    document.querySelector(".admin-tabs button")
  );

};


/* -------------------------
   ADD PACKAGE
------------------------- */

window.addPackage = async function() {

  const name =
    prompt("Package name:", "Wedding Package");

  if (!name) return;

  const price =
    prompt("Price:", "Contact us");

  const desc =
    prompt(
      "Description:",
      "Complete wedding photography package."
    );

  const itemsText =
    prompt(
      "Included items (comma separated):",
      "Wedding coverage, Candid photography, Edited photos"
    );

  const items =
    (itemsText || "")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);


  if (firebaseReady && db) {

    try {

      const {collection, addDoc} =
        window.firebaseFirestore;

      await addDoc(
        collection(db, "packages"),
        {
          name,
          price: price || "Contact us",
          details: desc || "",
          items,
          active: true,
          created: new Date().toISOString()
        }
      );

      await loadPackagesFromFirebase();

      showAdmin(
        "packages",
        document.querySelector(".admin-tabs button:nth-child(2)")
      );

      return;

    } catch (error) {

      console.error(error);

      alert(
        "Firebase save failed. Check Firestore Rules."
      );

    }

  }


  const data = localLoad("packages");

  data.push({
    name,
    price: price || "Contact us",
    desc: desc || "",
    items
  });

  localSave("packages", data);

  render();

  showAdmin(
    "packages",
    document.querySelector(".admin-tabs button:nth-child(2)")
  );

};


/* -------------------------
   EDIT PACKAGE
------------------------- */

window.editPackage = async function(i) {

  const data = localLoad("packages");

  const p = data[i];

  const name =
    prompt(
      "Package name:",
      p.name
    );

  if (!name) return;

  const price =
    prompt(
      "Price:",
      p.price
    ) || p.price;

  const desc =
    prompt(
      "Description:",
      p.desc
    ) || p.desc;

  const itemText =
    prompt(
      "Included items (comma separated):",
      (p.items || []).join(", ")
    );

  const items =
    (itemText || "")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);


  if (firebaseReady && db && p.id) {

    try {

      const {
        doc,
        updateDoc
      } = window.firebaseFirestore;

      await updateDoc(
        doc(db, "packages", p.id),
        {
          name,
          price,
          details: desc,
          items
        }
      );

      await loadPackagesFromFirebase();

      showAdmin(
        "packages",
        document.querySelector(".admin-tabs button:nth-child(2)")
      );

      return;

    } catch(error) {

      console.error(error);

      alert(
        "Firebase update failed."
      );

    }

  }


  p.name = name;
  p.price = price;
  p.desc = desc;
  p.items = items;

  localSave("packages", data);

  render();

  showAdmin(
    "packages",
    document.querySelector(".admin-tabs button:nth-child(2)")
  );

};


/* -------------------------
   DELETE PACKAGE
------------------------- */

window.deletePackage = async function(i) {

  const data = localLoad("packages");

  const p = data[i];

  if (!confirm("Delete this package?")) {
    return;
  }


  if (firebaseReady && db && p.id) {

    try {

      const {
        doc,
        deleteDoc
      } = window.firebaseFirestore;

      await deleteDoc(
        doc(db, "packages", p.id)
      );

      data.splice(i,1);

      localSave("packages", data);

      await loadPackagesFromFirebase();

      showAdmin(
        "packages",
        document.querySelector(".admin-tabs button:nth-child(2)")
      );

      return;

    } catch(error) {

      console.error(error);

      alert(
        "Firebase delete failed."
      );

    }

  }


  data.splice(i,1);

  localSave("packages", data);

  render();

  showAdmin(
    "packages",
    document.querySelector(".admin-tabs button:nth-child(2)")
  );

};


/* -------------------------
   DELETE APPOINTMENT
------------------------- */

window.deleteFirebaseBooking = async function(id) {

  if (!confirm("Delete this appointment?")) {
    return;
  }

  if (!firebaseReady || !db) {
    return;
  }

  try {

    const {
      doc,
      deleteDoc
    } = window.firebaseFirestore;

    await deleteDoc(
      doc(db, "appointments", id)
    );

    showAdmin(
      "bookings",
      document.querySelector(".admin-tabs button:nth-child(3)")
    );

  } catch(error) {

    console.error(error);

    alert(
      "Appointment delete failed."
    );

  }

};


/* -------------------------
   BOOKING FORM
------------------------- */

const bookingForm =
  document.getElementById("bookingForm");

if (bookingForm) {

  bookingForm.addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();

      const data =
        Object.fromEntries(
          new FormData(e.target).entries()
        );


      data.created =
        new Date().toISOString();


      /* FIREBASE */

      if (firebaseReady && db) {

        try {

          const {
            collection,
            addDoc
          } = window.firebaseFirestore;

          await addDoc(
            collection(db, "appointments"),
            data
          );

          document.getElementById(
            "bookingMsg"
          ).textContent =
            "Thank you! Your appointment request has been received. We will contact you soon.";

          e.target.reset();

          return;

        } catch(error) {

          console.error(error);

        }

      }


      /* LOCAL FALLBACK */

      const bookings =
        JSON.parse(
          localStorage.getItem(
            "ideal_bookings"
          ) || "[]"
        );

      bookings.push(data);

      localStorage.setItem(
        "ideal_bookings",
        JSON.stringify(bookings)
      );

      document.getElementById(
        "bookingMsg"
      ).textContent =
        "Thank you! Your appointment request has been saved.";

      e.target.reset();

    }
  );

}


/* -------------------------
   HTML SECURITY
------------------------- */

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* -------------------------
   YEAR
------------------------- */

const year =
  document.getElementById("year");

if (year) {
  year.textContent =
    new Date().getFullYear();
}


/* -------------------------
   START
------------------------- */

render();

startFirebase();


if (location.hash === "#admin") {

  setTimeout(() => {

    showAdmin(
      "photos",
      document.querySelector(
        ".admin-tabs button"
      )
    );

  },1000);

}
