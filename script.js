"use strict";

const SERVICES_FALLBACK = [
  {
    id: "swedish-massage",
    name: "Swedish Massage",
    category: "Massage",
    price: 850,
    duration: "60 minutes",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80",
    short: "A soothing full-body massage to ease tension and encourage deep relaxation.",
    description: "Enjoy flowing massage strokes and gentle-to-medium pressure designed to help relax tired muscles, ease everyday tension, and leave you feeling refreshed.",
    benefits: ["Encourages relaxation", "Helps ease everyday muscle tension", "A calming full-body experience"]
  },
  {
    id: "hot-stone",
    name: "Hot Stone Massage",
    category: "Massage",
    price: 1200,
    duration: "75 minutes",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80",
    short: "Warm stones and flowing massage techniques create a deeply calming ritual.",
    description: "Smooth, warmed stones are incorporated into a relaxing massage to create a comforting treatment for the body. Ideal when you want to slow down and unwind.",
    benefits: ["Comforting warmth", "Relaxing massage experience", "A peaceful wellness ritual"]
  },
  {
    id: "aromatherapy",
    name: "Aromatherapy Massage",
    category: "Massage",
    price: 1000,
    duration: "60 minutes",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=900&q=80",
    short: "A gentle massage paired with aromatic oils for a peaceful escape.",
    description: "A relaxing massage experience using aromatic oils and gentle techniques. Choose a quiet moment to recharge your senses and enjoy a calming spa ritual.",
    benefits: ["Aromatic oil experience", "Gentle relaxing techniques", "Time to recharge"]
  },
  {
    id: "facial",
    name: "Refreshing Facial",
    category: "Skin Care",
    price: 750,
    duration: "45 minutes",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
    short: "A refreshing facial cleansing ritual to leave your skin feeling cared for.",
    description: "A gentle facial treatment featuring cleansing and moisturizing steps to refresh your skin. Your therapist will help tailor the experience to your comfort.",
    benefits: ["Cleansing and moisturizing", "A refreshing skin-care ritual", "Personalized attention"]
  },
  {
    id: "body-scrub",
    name: "Body Scrub",
    category: "Body Care",
    price: 900,
    duration: "50 minutes",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    short: "A body-care treatment with exfoliation to leave skin feeling smooth.",
    description: "Enjoy a body exfoliation treatment designed to buff away dull surface buildup and leave your skin feeling soft and smooth. Finished with a nourishing moisturizer.",
    benefits: ["Exfoliation", "Softer-feeling skin", "Moisturizing finish"]
  },
  {
    id: "foot-reflexology",
    name: "Foot Reflexology",
    category: "Body Care",
    price: 600,
    duration: "40 minutes",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
    short: "A focused foot massage to help tired feet feel relaxed and refreshed.",
    description: "A focused foot treatment using comfortable pressure and massage techniques. A lovely choice after a long day on your feet.",
    benefits: ["Focused foot massage", "A relaxing break for tired feet", "Comfortable pressure"]
  },
  {
    id: "manicure-pedicure",
    name: "Manicure & Pedicure",
    category: "Beauty",
    price: 650,
    duration: "60 minutes",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80",
    short: "A neat and relaxing nail-care session for hands and feet.",
    description: "A tidy, relaxing nail-care service that includes shaping, cuticle care, and polish. Enjoy a little self-care from fingertips to toes.",
    benefits: ["Nail shaping and care", "Hand and foot pampering", "Polish finish"]
  }
];

const THERAPISTS = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  name: `Therapist ${String(i + 1).padStart(2, "0")}`,
  role: "Professional Spa Therapist"
}));

let services = [];

const $ = selector => document.querySelector(selector);

const peso = amount =>
  "₱" + Number(amount).toLocaleString("en-PH");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function cardHTML(service) {
  return `
    <article class="service-card"
      tabindex="0"
      role="button"
      data-service="${escapeHTML(service.id)}"
      aria-label="View ${escapeHTML(service.name)} details">

      <img src="${escapeHTML(service.image)}"
        alt="${escapeHTML(service.name)}"
        loading="lazy">

      <div class="service-card-body">
        <h3>${escapeHTML(service.name)}</h3>
        <p>${escapeHTML(service.short)}</p>

        <div class="card-meta">
          <span class="price">${peso(service.price)}</span>
          <span class="duration">${escapeHTML(service.duration)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderCards(target, list) {
  $(target).innerHTML = list.map(cardHTML).join("");
}

async function loadServices() {
  $("#serviceLoading").hidden = false;

  try {
    const response = await fetch("/api/services");

    if (!response.ok) {
      throw new Error("Service API unavailable");
    }

    const data = await response.json();

    if (!Array.isArray(data) || !data.length) {
      throw new Error("No services returned");
    }

    services = data;

  } catch (error) {
    services = SERVICES_FALLBACK;
  }

  $("#serviceLoading").hidden = true;

  renderCards("#serviceGrid", services);
  renderCards("#homeServices", services.slice(0, 3));

  renderBookingOptions();
}

function renderBookingOptions() {
  $("#bookingService").innerHTML =
    '<option value="">Choose a spa service</option>' +
    services.map(service => `
      <option value="${escapeHTML(service.id)}">
        ${escapeHTML(service.name)} — ${peso(service.price)}
      </option>
    `).join("");

  $("#bookingMenu").innerHTML =
    services.map(service => `
      <button type="button"
        class="menu-service"
        data-choose-service="${escapeHTML(service.id)}">

        <span>
          <strong>${escapeHTML(service.name)}</strong>
          <small>${escapeHTML(service.duration)}</small>
        </span>

        <b>${peso(service.price)}</b>
      </button>
    `).join("");

  $("#bookingTherapist").innerHTML =
    '<option value="">Any available therapist</option>' +
    THERAPISTS.map(therapist => `
      <option value="${therapist.id}">
        ${therapist.name}
      </option>
    `).join("");
}

function renderTherapists() {
  $("#therapistGrid").innerHTML =
    THERAPISTS.map(therapist => `
      <article class="therapist-card">
        <div class="therapist-avatar">
          ${therapist.id.padStart(2, "0")}
        </div>
        <h3>${therapist.name}</h3>
        <p>${therapist.role}</p>
      </article>
    `).join("");
}

function showDetail(id) {
  const service = services.find(item => item.id === id);

  if (!service) return;

  $("#serviceDetail").innerHTML = `
    <div class="detail-layout">

      <img src="${escapeHTML(service.image)}"
        alt="${escapeHTML(service.name)}">

      <div class="detail-copy">

        <p class="eyebrow">
          ${escapeHTML(service.category || "SPA TREATMENT")}
        </p>

        <h1>${escapeHTML(service.name)}</h1>

        <p>
          ${escapeHTML(service.description || service.short)}
        </p>

        <div class="detail-price">
          ${peso(service.price)}
          <span class="duration">
            / ${escapeHTML(service.duration)}
          </span>
        </div>

        <h3>What to expect</h3>

        <ul>
          ${(service.benefits || [
            "A relaxing spa experience",
            "Personal attention from our team"
          ]).map(item => `
            <li>${escapeHTML(item)}</li>
          `).join("")}
        </ul>

        <a class="button"
          href="#booking"
          data-book-service="${escapeHTML(service.id)}">
          Book this service
        </a>

      </div>
    </div>
  `;

  navigate("detail");
}

function navigate(page) {
  const pages = {
    home: "#homeView",
    services: "#servicesView",
    detail: "#detailView",
    therapists: "#therapistsView",
    booking: "#bookingView"
  };

  Object.values(pages).forEach(selector => {
    $(selector).classList.remove("active");
  });

  $(pages[page] || pages.home).classList.add("active");

  document.querySelectorAll("nav a").forEach(link => {
    link.classList.toggle("active", link.dataset.view === page);
  });

  $("#mainNav").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function setBookingService(id) {
  const service = services.find(item => item.id === id);

  if (!service) return;

  $("#bookingService").value = id;

  $("#selectedPrice").textContent =
    `${service.name}: ${peso(service.price)} · ${service.duration}`;
}

document.addEventListener("click", event => {
  const card = event.target.closest("[data-service]");

  if (card) {
    showDetail(card.dataset.service);
    return;
  }

  const choose = event.target.closest("[data-choose-service]");

  if (choose) {
    setBookingService(choose.dataset.chooseService);

    $("#bookingForm").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    return;
  }

  const book = event.target.closest("[data-book-service]");

  if (book) {
    setBookingService(book.dataset.bookService);
  }
});

document.addEventListener("keydown", event => {
  if (
    (event.key === "Enter" || event.key === " ") &&
    event.target.matches("[data-service]")
  ) {
    event.preventDefault();
    showDetail(event.target.dataset.service);
  }
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const target = link.getAttribute("href").slice(1);

    const pageMap = {
      home: "home",
      services: "services",
      about: "home",
      gallery: "home",
      booking: "booking",
      therapists: "therapists"
    };

    if (pageMap[target]) {
      event.preventDefault();
      navigate(pageMap[target]);
    }
  });
});

$("#backToServices").addEventListener("click", () => {
  navigate("services");
});

$("#menuToggle").addEventListener("click", () => {
  const open = $("#mainNav").classList.toggle("open");

  $("#menuToggle").setAttribute(
    "aria-expanded",
    String(open)
  );
});

$("#bookingService").addEventListener("change", event => {
  setBookingService(event.target.value);
});

const timeOptions = [];

for (let hour = 9; hour <= 19; hour++) {
  for (const minute of ["00", "30"]) {
    if (hour === 19 && minute === "30") continue;

    const displayHour = hour % 12 || 12;

    timeOptions.push(
      `${String(hour).padStart(2, "0")}:${minute} (${displayHour}:${minute} ${hour < 12 ? "AM" : "PM"})`
    );
  }
}

$("#bookingTime").innerHTML =
  '<option value="">Choose a time</option>' +
  timeOptions.map(time => `
    <option value="${time.slice(0, 5)}">
      ${time.slice(6)}
    </option>
  `).join("");

const today = new Date();

$("#bookingDate").min =
  new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

$("#bookingForm").addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;

  const data = Object.fromEntries(
    new FormData(form).entries()
  );

  const service = services.find(item => item.id === data.service);

  if (!service) {
    $("#bookingMessage").textContent =
      "Please choose a spa service.";
    return;
  }

  const therapist = THERAPISTS.find(
    item => item.id === data.therapist
  );

  const payload = {
    ...data,
    serviceName: service.name,
    price: service.price,
    therapistName: therapist
      ? therapist.name
      : "Any available therapist"
  };

  const button = $("#submitBooking");

  button.disabled = true;
  button.textContent = "Submitting…";
  $("#bookingMessage").textContent = "";

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Unable to complete booking."
      );
    }

    $("#bookingMessage").textContent =
      result.message || "Your booking request has been received.";

    form.reset();

    $("#selectedPrice").textContent =
      "Select a service to see its price.";

  } catch (error) {
    if (location.protocol === "file:") {
      $("#bookingMessage").textContent =
        "Demo only: start the Node.js server to save bookings.";
    } else {
      $("#bookingMessage").textContent = error.message;
    }

  } finally {
    button.disabled = false;
    button.textContent = "Confirm booking";
  }
});

$("#year").textContent = new Date().getFullYear();

renderTherapists();
loadServices();