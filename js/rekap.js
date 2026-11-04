// ===== REKAP PRESENSI DUMMY BPKK KENDARI =====
(() => {
  const $ = (id) => document.getElementById(id);
  if (!$("rekap-list")) return;

  let logs = [];
  let filtered = [];
  let currentPage = 1;
  const pageSize = 10;

  const activities = [
    "Melakukan pengarsipan dokumen administrasi.",
    "Memperbarui data dan laporan kegiatan.",
    "Melaksanakan pelayanan administrasi.",
    "Melakukan pengecekan kelengkapan dokumen.",
    "Menyusun laporan kegiatan harian.",
    "Mengolah data dan melakukan verifikasi.",
    "Melakukan koordinasi kegiatan unit kerja.",
  ];

  const pad = (n) => String(n).padStart(2, "0");

  function getWorkDates() {
    const dates = [];
    for (let day = 1; day <= 31 && dates.length < 17; day++) {
      const date = new Date(2026, 9, day);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(`2026-10-${pad(day)}`);
      }
    }
    return dates;
  }

  function makeDummyLogs(people) {
    const dates = getWorkDates();
    const results = [];

    people.forEach((person, i) => {
      dates.forEach((tanggal, j) => {
        const number = i * 17 + j;
        const absent = number % 19 === 0;
        const late = !absent && number % 7 === 0;
        const friday = new Date(tanggal + "T12:00:00").getDay() === 5;

        const masuk = absent
          ? "-"
          : late
          ? `08:${pad(5 + (number % 35))}`
          : `07:${pad(10 + (number % 20))}`;

        const pulang = absent
          ? "-"
          : friday
          ? `17:${pad(number % 25)}`
          : `16:${pad(number % 25)}`;

        const jarakMasuk = absent ? null : 40 + (number % 530);
        const jarakPulang = absent ? null : 50 + ((number * 3) % 520);

        results.push({
          id: `LOG-${pad(i + 1)}-${pad(j + 1)}`,
          id_pegawai: person.id,
          nama: person.nama,
          jabatan: person.jabatan,
          unit_kerja: person.unit_kerja,
          tanggal,
          jam_masuk: masuk,
          jam_pulang: pulang,
          status: absent ? "Tidak Hadir" : late ? "Terlambat" : "Hadir",
          gps_masuk: absent
            ? "Tidak tersedia"
            : jarakMasuk <= 500
            ? "Valid"
            : "Di luar radius",
          gps_pulang: absent
            ? "Tidak tersedia"
            : jarakPulang <= 500
            ? "Valid"
            : "Di luar radius",
          jarak_masuk: jarakMasuk,
          jarak_pulang: jarakPulang,
          foto_masuk: absent ? "-" : "Foto simulasi masuk",
          foto_pulang: absent ? "-" : "Foto simulasi pulang",
          aktivitas: absent ? "-" : activities[number % activities.length],
          keterangan: absent
            ? "Tidak ada presensi tercatat (simulasi)."
            : "Data simulasi untuk pengujian sistem.",
        });
      });
    });

    return results.sort(
      (a, b) =>
        b.tanggal.localeCompare(a.tanggal) || a.nama.localeCompare(b.nama)
    );
  }

  function render() {
    const start = $("rekap-start").value;
    const end = $("rekap-end").value;
    const person = $("rekap-employee").value;
    const status = $("rekap-status").value;

    filtered = logs.filter(
      (log) =>
        (!start || log.tanggal >= start) &&
        (!end || log.tanggal <= end) &&
        (person === "all" || log.id_pegawai === person) &&
        (status === "all" || log.status === status)
    );

    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, pages);

    $("rekap-total").textContent = filtered.length;
    $("rekap-hadir").textContent = filtered.filter(
      (x) => x.status === "Hadir"
    ).length;
    $("rekap-terlambat").textContent = filtered.filter(
      (x) => x.status === "Terlambat"
    ).length;
    $("rekap-absen").textContent = filtered.filter(
      (x) => x.status === "Tidak Hadir"
    ).length;

    const tbody = $("rekap-list");
    tbody.replaceChildren();

    const startIndex = (currentPage - 1) * pageSize;
    const pageLogs = filtered.slice(startIndex, startIndex + pageSize);

    pageLogs.forEach((log) => {
      const tr = document.createElement("tr");

      [
        log.tanggal,
        log.nama,
        log.jam_masuk,
        log.jam_pulang,
        log.status,
        log.gps_masuk,
      ].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.append(td);
      });

      const td = document.createElement("td");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rekap-detail-button";
      button.textContent = "Lihat";
      button.addEventListener("click", () => showDetail(log));
      td.append(button);
      tr.append(td);
      tbody.append(tr);
    });

    $(
      "rekap-page-info"
    ).textContent = `Halaman ${currentPage} dari ${pages} (${filtered.length} log)`;

    $("rekap-prev").disabled = currentPage === 1;
    $("rekap-next").disabled = currentPage === pages;
  }

  function showDetail(log) {
    $("rekap-modal-title").textContent = `Detail Presensi - ${log.nama}`;

    const content = $("rekap-detail-content");
    content.replaceChildren();

    const grid = document.createElement("div");
    grid.className = "rekap-detail-grid";

    const fields = [
      ["ID Pegawai", log.id_pegawai],
      ["Nama", log.nama],
      ["Jabatan", log.jabatan],
      ["Unit Kerja", log.unit_kerja],
      ["Tanggal", log.tanggal],
      ["Status Kehadiran", log.status],
      ["Jam Masuk", log.jam_masuk],
      ["Jam Pulang", log.jam_pulang],
      ["GPS Masuk", log.gps_masuk],
      ["GPS Pulang", log.gps_pulang],
      [
        "Jarak Masuk",
        log.jarak_masuk === null ? "-" : `${log.jarak_masuk} meter`,
      ],
      [
        "Jarak Pulang",
        log.jarak_pulang === null ? "-" : `${log.jarak_pulang} meter`,
      ],
      ["Foto Masuk", log.foto_masuk],
      ["Foto Pulang", log.foto_pulang],
      ["Aktivitas Harian", log.aktivitas],
      ["Keterangan", log.keterangan],
    ];

    fields.forEach(([label, value]) => {
      const box = document.createElement("div");
      box.className = "rekap-detail-item";

      const title = document.createElement("strong");
      title.textContent = label;

      const text = document.createElement("span");
      text.textContent = value;

      box.append(title, text);
      grid.append(box);
    });

    content.append(grid);
    $("rekap-modal").hidden = false;
  }

  function exportCSV() {
    const headers = [
      "Tanggal",
      "ID Pegawai",
      "Nama",
      "Jabatan",
      "Unit Kerja",
      "Jam Masuk",
      "Jam Pulang",
      "Status Kehadiran",
      "GPS Masuk",
      "GPS Pulang",
      "Jarak Masuk (m)",
      "Jarak Pulang (m)",
      "Foto Masuk",
      "Foto Pulang",
      "Aktivitas Harian",
      "Keterangan",
    ];

    const rows = filtered.map((x) => [
      x.tanggal,
      x.id_pegawai,
      x.nama,
      x.jabatan,
      x.unit_kerja,
      x.jam_masuk,
      x.jam_pulang,
      x.status,
      x.gps_masuk,
      x.gps_pulang,
      x.jarak_masuk,
      x.jarak_pulang,
      x.foto_masuk,
      x.foto_pulang,
      x.aktivitas,
      x.keterangan,
    ]);

    const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map(escapeCSV).join(","))
        .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rekap-presensi-bpkk-dummy.csv";
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function init() {
    try {
      let people = [];

      // Utamakan data pegawai terbaru dari CRUD
      const saved = localStorage.getItem("bpkk_pegawai_v1");

      if (saved !== null) {
        people = JSON.parse(saved);
      } else {
        const response = await fetch("dummy/data_pegawai_dummy.json");
        if (!response.ok) throw new Error("JSON pegawai gagal dimuat");
        const data = await response.json();
        people = data.pegawai;
      }

      if (!Array.isArray(people)) {
        throw new Error("Format data pegawai tidak valid");
      }

      logs = makeDummyLogs(people);

      const select = $("rekap-employee");
      people.forEach((person) => {
        const option = document.createElement("option");
        option.value = person.id;
        option.textContent = `${person.nama} (${person.id})`;
        select.append(option);
      });

      render();
    } catch (error) {
      console.error("Gagal memuat rekap:", error);
      $("rekap-page-info").textContent =
        "Data rekap gagal dimuat. Periksa Console browser.";
    }
  }

  ["rekap-start", "rekap-end", "rekap-employee", "rekap-status"].forEach(
    (id) => {
      $(id).addEventListener("change", () => {
        currentPage = 1;
        render();
      });
    }
  );

  $("rekap-prev").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  });

  $("rekap-next").addEventListener("click", () => {
    currentPage++;
    render();
  });

  $("rekap-export").addEventListener("click", exportCSV);

  $("rekap-close").addEventListener("click", () => {
    $("rekap-modal").hidden = true;
  });

  $("rekap-modal").addEventListener("click", (event) => {
    if (event.target === $("rekap-modal")) {
      $("rekap-modal").hidden = true;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      $("rekap-modal").hidden = true;
    }
  });

  // ===== GRAFIK KEHADIRAN DINAMIS =====
  function renderAttendanceCharts() {
    const trendContainer = document.getElementById("attendance-trend-chart");
    const trendNote = document.getElementById("attendance-trend-note");
    const rateNumber = document.getElementById("attendance-rate-number");
    const rateNote = document.getElementById("attendance-rate-note");

    // Jangan menjalankan grafik jika elemen tidak tersedia.
    if (!trendContainer || !rateNumber) return;

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const monthly = months.map((month, index) => {
      const monthNumber = String(index + 1).padStart(2, "0");
      const monthLogs = logs.filter((log) =>
        log.tanggal.startsWith(`2026-${monthNumber}-`)
      );

      const hadir = monthLogs.filter((log) => log.status === "Hadir").length;

      const terlambat = monthLogs.filter(
        (log) => log.status === "Terlambat"
      ).length;

      const tidakHadir = monthLogs.filter(
        (log) => log.status === "Tidak Hadir"
      ).length;

      const total = monthLogs.length;
      const tingkat = total ? ((hadir + terlambat) / total) * 100 : null;

      return {
        month,
        total,
        hadir,
        terlambat,
        tidakHadir,
        tingkat,
      };
    });

    // Grafik batang: bulan tanpa data tetap kosong.
    trendContainer.replaceChildren();

    monthly.forEach((data) => {
      const group = document.createElement("div");
      group.className = "bar-group";

      if (data.total > 0) {
        const stack = document.createElement("div");
        stack.className = "bar-stack";
        stack.style.height = "100%";
        stack.style.justifyContent = "flex-end";
        stack.style.position = "relative";
        stack.style.marginTop = "0";

        const hadir = document.createElement("span");
        hadir.className = "bar-present";
        hadir.style.height = `${(data.hadir / data.total) * 100}%`;

        const terlambat = document.createElement("span");
        terlambat.className = "bar-late";
        terlambat.style.height = `${(data.terlambat / data.total) * 100}%`;

        const tidakHadir = document.createElement("span");
        tidakHadir.className = "bar-absent";
        tidakHadir.style.height = `${(data.tidakHadir / data.total) * 100}%`;

        stack.append(hadir, terlambat, tidakHadir);
        stack.title =
          `${data.month}: ${data.hadir} hadir, ` +
          `${data.terlambat} terlambat, ` +
          `${data.tidakHadir} tidak hadir`;

        group.append(stack);
      } else {
        group.classList.add("bar-group-empty");
      }

      const label = document.createElement("span");
      label.className = "bar-label";
      label.textContent = data.month;
      group.append(label);

      trendContainer.append(group);
    });

    const availableMonths = monthly.filter((data) => data.total > 0);

    trendNote.textContent = availableMonths.length
      ? `Data tersedia pada ${availableMonths
          .map((data) => data.month)
          .join(", ")}. ` +
        "Tinggi batang menunjukkan proporsi status dari seluruh log pada bulan tersebut."
      : "Belum ada data presensi tahun 2026.";

    // Grafik garis: bulan tanpa data tidak diberi titik atau garis.
    const area = document.getElementById("attendance-rate-area");
    const line = document.getElementById("attendance-rate-line");
    const points = document.getElementById("attendance-rate-points");
    const values = document.getElementById("attendance-rate-values");
    const labels = document.getElementById("attendance-rate-months");

    area.replaceChildren();
    line.setAttribute("points", "");
    points.replaceChildren();
    values.replaceChildren();
    labels.replaceChildren();

    // Posisi horizontal mengikuti 12 bulan.
    const xPosition = (index) => 30 + index * (310 / 11);

    // Grafik menggunakan rentang 0–100% agar tidak menyesatkan.
    const yPosition = (rate) => 145 - (rate / 100) * 120;

    monthly.forEach((data, index) => {
      const x = xPosition(index);

      const monthLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      monthLabel.setAttribute("x", x);
      monthLabel.setAttribute("y", "163");
      monthLabel.textContent = data.month;
      labels.append(monthLabel);

      if (data.tingkat === null) return;

      const y = yPosition(data.tingkat);

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", "4");
      circle.setAttribute(
        "aria-label",
        `${data.month}: ${data.tingkat.toFixed(1)}%`
      );
      points.append(circle);

      const value = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      value.setAttribute("x", x);
      value.setAttribute("y", Math.max(12, y - 10));
      value.textContent = `${Math.round(data.tingkat)}%`;
      values.append(value);
    });

    // Buat garis hanya di antara bulan yang memiliki data.
    // Jika ada jeda bulan kosong, garis tidak menyambungkan kedua bulan.
    const runs = [];
    let run = [];

    monthly.forEach((data, index) => {
      if (data.tingkat === null) {
        if (run.length) runs.push(run);
        run = [];
      } else {
        run.push({ index, rate: data.tingkat });
      }
    });

    if (run.length) runs.push(run);

    runs.forEach((segment) => {
      if (segment.length >= 2) {
        const polyline = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polyline"
        );
        polyline.setAttribute(
          "points",
          segment
            .map(
              (point) => `${xPosition(point.index)},${yPosition(point.rate)}`
            )
            .join(" ")
        );
        polyline.setAttribute("class", "line-path");
        document.getElementById("attendance-rate-chart").append(polyline);
      }
    });

    if (availableMonths.length) {
      const latest = availableMonths[availableMonths.length - 1];
      rateNumber.textContent = `${Math.round(latest.tingkat)}%`;
      rateNote.textContent =
        `Tingkat kehadiran ${latest.month} berdasarkan log presensi yang tersedia. ` +
        "Hadir dan terlambat dihitung sebagai kehadiran.";
    } else {
      rateNumber.textContent = "—";
      rateNote.textContent = "Belum ada data presensi tahun 2026.";
    }
  }

  init().then(() => {
    renderAttendanceCharts();
  });
})();
