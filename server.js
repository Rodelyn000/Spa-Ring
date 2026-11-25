"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA = path.join(ROOT, "data");
const BOOKINGS = path.join(DATA, "bookings.json");
const SERVICES_FILE = path.join(ROOT, "services.json");

const THERAPISTS = {
  "1": "Maria Santos",
  "2": "Angelica Reyes",
  "3": "Joanna Dela Cruz",
  "4": "Kristine Navarro",
  "5": "Rhea Villanueva",
  "6": "Patricia Mendoza",
  "7": "Jasmine Ramos",
  "8": "Carla Bautista",
  "9": "Lorna Aquino",
  "10": "Danica Flores",
  "11": "Marites Castillo",
  "12": "Bianca Garcia",
  "13": "Nicole Torres",
  "14": "Shiela Domingo",
  "15": "Angela Pascual",
  "16": "Mylene Aguilar",
  "17": "Camille Rivera",
  "18": "Evelyn Cruz",
  "19": "Hannah Lopez",
  "20": "Grace Fernandez"
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function send(res, status, data, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store"
  });

  res.end(
    typeof data === "string" || Buffer.isBuffer(data)
      ? data
      : JSON.stringify(data)
  );
}

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function saveBookings(bookings) {
  fs.mkdirSync(DATA, { recursive: true });

  const temporaryFile = BOOKINGS + ".tmp";

  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(bookings, null, 2)
  );

  fs.renameSync(temporaryFile, BOOKINGS);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", chunk => {
      raw += chunk;

      if (raw.length > 20000) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

function serveFile(res, file) {
  const resolvedFile = path.resolve(ROOT, file);

  if (
    resolvedFile !== ROOT &&
    !resolvedFile.startsWith(ROOT + path.sep)
  ) {
    return send(res, 403, "Forbidden", "text/plain");
  }

  fs.readFile(resolvedFile, (error, data) => {
    if (error) {
      return send(res, 404, "File not found", "text/plain");
    }

    const extension = path.extname(resolvedFile).toLowerCase();

    send(
      res,
      200,
      data,
      MIME_TYPES[extension] || "application/octet-stream"
    );
  });
}

function getServices() {
  return readJSON(SERVICES_FILE, []);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(date + "T00:00:00");

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return parsed >= today;
}

function validTime(time) {
  return /^([01]\d|2[0-3]):(00|30)$/.test(time);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);

    if (req.method === "GET" && pathname === "/api/services") {
      const services = getServices();

      return send(res, 200, services);
    }

    if (req.method === "POST" && pathname === "/api/bookings") {
      const data = await readRequestBody(req);

      const name = String(data.name || "").trim();
      const email = String(data.email || "").trim().toLowerCase();
      const phone = String(data.phone || "").trim();
      const date = String(data.date || "");
      const time = String(data.time || "");
      const serviceId = String(data.service || "");

      const services = getServices();

      const service = services.find(
        item => item.id === serviceId
      );

      if (name.length < 2 || name.length > 80) {
        return send(res, 400, {
          error: "Please enter a valid full name."
        });
      }

      if (!validEmail(email) || email.length > 120) {
        return send(res, 400, {
          error: "Please enter a valid email address."
        });
      }

      if (phone.length < 7 || phone.length > 30) {
        return send(res, 400, {
          error: "Please enter a valid phone number."
        });
      }

      if (!service) {
        return send(res, 400, {
          error: "Please select a valid spa service."
        });
      }

      if (!validDate(date)) {
        return send(res, 400, {
          error: "Please select a valid booking date."
        });
      }

      if (!validTime(time)) {
        return send(res, 400, {
          error: "Please select a valid booking time."
        });
      }

      const therapistId = String(data.therapist || "");

      if (
        therapistId &&
        !/^(?:[1-9]|1\d|20)$/.test(therapistId)
      ) {
        return send(res, 400, {
          error: "Please select a valid therapist."
        });
      }

      const therapistName = therapistId
        ? THERAPISTS[therapistId]
        : "Any available therapist";

      const bookings = readJSON(BOOKINGS, []);

      const duplicate = bookings.some(booking =>
        booking.email === email &&
        booking.date === date &&
        booking.time === time
      );

      if (duplicate) {
        return send(res, 409, {
          error: "You already have a booking at this time."
        });
      }

      const booking = {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        service: service.name,
        serviceId: service.id,
        price: service.price,
        therapist: therapistName,
        therapistId: therapistId || null,
        date,
        time,
        notes: String(data.notes || "").trim().slice(0, 300),
        status: "Pending",
        createdAt: new Date().toISOString()
      };

      bookings.push(booking);

      saveBookings(bookings);

      return send(res, 201, {
        message: "Your SpaRing booking request has been submitted successfully!",
        booking: {
          id: booking.id,
          service: booking.service,
          price: booking.price,
          therapist: booking.therapist,
          date: booking.date,
          time: booking.time,
          status: booking.status
        }
      });
    }

    if (req.method === "GET") {
      const requestedPath = pathname === "/"
        ? "index.html"
        : pathname.slice(1);

      return serveFile(res, requestedPath);
    }

    return send(res, 405, {
      error: "Method not allowed."
    });

  } catch (error) {
    console.error(error);

    return send(res, 500, {
      error: "Something went wrong. Please try again."
    });
  }
});

server.listen(PORT, () => {
  console.log("----------------------------------");
  console.log("       SPARING SPA APPLICATION");
  console.log("----------------------------------");
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("Services API: /api/services");
  console.log("Bookings API: /api/bookings");
  console.log("Logo folder: /logo/");
  console.log("----------------------------------");
});