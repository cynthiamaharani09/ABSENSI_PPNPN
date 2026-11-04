// Pengaturan zona waktu
const ZONA_WAKTU = "Asia/Makassar";

// Mengambil tanggal berdasarkan zona waktu WITA
function getTanggalWITA() {
  const sekarang = new Date();

  const bagianTanggal = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_WAKTU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(sekarang);

  const tanggal = {};
  bagianTanggal.forEach((bagian) => {
    tanggal[bagian.type] = bagian.value;
  });

  return `${tanggal.year}-${tanggal.month}-${tanggal.day}`;
}

// Mengambil waktu berdasarkan zona waktu WITA
function getWaktuWITA() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONA_WAKTU,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

// Mengambil tanggal lengkap untuk ditampilkan
function getTanggalLengkap() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONA_WAKTU,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

// Membuat kunci penyimpanan berdasarkan tanggal
function getKunciPresensi() {
  return `bpkk-presensi-${getTanggalWITA()}`;
}

// Mengambil data presensi hari ini
function getDataPresensi() {
  const data = localStorage.getItem(getKunciPresensi());

  return data
    ? JSON.parse(data)
    : {
        masuk: null,
        pulang: null,
      };
}

// Menyimpan data presensi hari ini
function simpanDataPresensi(data) {
  localStorage.setItem(getKunciPresensi(), JSON.stringify(data));
}

// Memperbarui tampilan jam dan tanggal
function perbaruiWaktu() {
  const elemenJam = document.querySelector(".clock-value");
  const elemenTanggal = document.querySelector(".current-date time");

  if (elemenJam) {
    elemenJam.innerHTML = `${getWaktuWITA()} <small>WITA</small>`;
  }

  if (elemenTanggal) {
    elemenTanggal.textContent = getTanggalLengkap();
    elemenTanggal.setAttribute("datetime", getTanggalWITA());
  }
}

// Memperbarui tampilan informasi presensi
function perbaruiTampilanPresensi() {
  const data = getDataPresensi();
  const kartuWaktu = document.querySelectorAll(".time-card");
  const statusPegawai = document.querySelector(".employee-meta .status-badge");

  // Presensi masuk
  if (kartuWaktu[0]) {
    const waktuMasuk = kartuWaktu[0].querySelector(".time-value");
    const statusMasuk = kartuWaktu[0].querySelector(".status-text");

    waktuMasuk.innerHTML = `${data.masuk || "--:--"} <small>WITA</small>`;

    statusMasuk.innerHTML = data.masuk
      ? '<span class="status-dot"></span> Sudah tercatat'
      : '<span class="status-dot status-dot-gray"></span> Belum tercatat';
  }

  // Presensi pulang
  if (kartuWaktu[1]) {
    const waktuPulang = kartuWaktu[1].querySelector(".time-value");
    const statusPulang = kartuWaktu[1].querySelector(".status-text");

    waktuPulang.innerHTML = `${data.pulang || "--:--"} <small>WITA</small>`;

    statusPulang.innerHTML = data.pulang
      ? '<span class="status-dot"></span> Sudah tercatat'
      : '<span class="status-dot status-dot-gray"></span> Belum tercatat';
  }

  // Status pegawai
  if (statusPegawai) {
    if (data.pulang) {
      statusPegawai.textContent = "Presensi selesai";
    } else if (data.masuk) {
      statusPegawai.textContent = "Sudah presensi masuk";
    } else {
      statusPegawai.textContent = "Belum presensi";
    }
  }
}

// Fungsi pencatatan waktu masuk
function simpanWaktuMasuk() {
  const data = getDataPresensi();

  if (data.masuk) {
    return false;
  }

  data.masuk = getWaktuWITA();
  simpanDataPresensi(data);
  perbaruiTampilanPresensi();

  return true;
}

// Fungsi pencatatan waktu pulang
function simpanWaktuPulang() {
  const data = getDataPresensi();

  if (!data.masuk || data.pulang) {
    return false;
  }

  data.pulang = getWaktuWITA();
  simpanDataPresensi(data);
  perbaruiTampilanPresensi();

  return true;
}

// Menjalankan pembaruan ketika halaman dibuka
function mulaiPresensi() {
  perbaruiWaktu();
  perbaruiTampilanPresensi();

  setInterval(perbaruiWaktu, 1000);
}

// Menyediakan fungsi untuk integrasi tahap berikutnya
window.PresensiData = {
  getDataPresensi,
  simpanWaktuMasuk,
  simpanWaktuPulang,
  perbaruiTampilanPresensi,
};

document.addEventListener("DOMContentLoaded", mulaiPresensi);

// Verifikasi selfie
let cameraStream = null;
let capturedPhoto = null;
let cameraMirror = true;

const cameraVideo = document.getElementById("camera-video");
const cameraCanvas = document.getElementById("camera-canvas");
const capturedImage = document.getElementById("captured-photo");
const cameraPlaceholder = document.getElementById("camera-placeholder");

const cameraMessage = document.getElementById("camera-message");
const cameraDescription = document.getElementById("camera-description");

const startCameraButton = document.getElementById("start-camera");
const capturePhotoButton = document.getElementById("capture-photo");
const retakePhotoButton = document.getElementById("retake-photo");
const toggleMirrorButton = document.getElementById("toggle-camera-mirror");

// Mengaktifkan kamera perangkat
async function aktifkanKamera() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Browser tidak mendukung akses kamera.");
    }

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: false,
    });

    cameraVideo.srcObject = cameraStream;
    cameraVideo.style.transform = cameraMirror ? "scaleX(-1)" : "none";
    toggleMirrorButton.hidden = false;
    toggleMirrorButton.textContent = cameraMirror
      ? "Mode Cermin"
      : "Mode Normal";
    cameraVideo.hidden = false;
    cameraPlaceholder.hidden = true;
    capturedImage.hidden = true;

    cameraMessage.textContent = "Kamera aktif";
    cameraDescription.textContent =
      "Posisikan wajah di tengah dengan pencahayaan cukup.";

    startCameraButton.hidden = true;
    capturePhotoButton.hidden = false;
    retakePhotoButton.hidden = true;
  } catch (error) {
    startCameraButton.hidden = false;
    capturePhotoButton.hidden = true;
    retakePhotoButton.hidden = true;
    console.error("Kesalahan kamera:", error);

    cameraMessage.textContent = "Kamera tidak dapat diaktifkan";
    cameraDescription.textContent =
      "Periksa izin kamera pada browser dan pastikan kamera tidak sedang digunakan aplikasi lain.";

    alert("Kamera gagal diaktifkan. Periksa izin kamera pada browser.");
  }
}

// Menghentikan kamera
function hentikanKamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  cameraVideo.srcObject = null;
}

// Mengambil foto selfie
function ambilFoto() {
  if (!cameraStream || !cameraVideo.videoWidth) {
    alert("Kamera belum siap. Silakan tunggu beberapa saat.");
    return;
  }

  cameraCanvas.width = cameraVideo.videoWidth;
  cameraCanvas.height = cameraVideo.videoHeight;

  const context = cameraCanvas.getContext("2d");

  if (cameraMirror) {
    context.translate(cameraCanvas.width, 0);
    context.scale(-1, 1);
  }

  context.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);

  capturedPhoto = cameraCanvas.toDataURL("image/jpeg", 0.85);

  capturedImage.src = capturedPhoto;
  capturedImage.hidden = false;
  cameraVideo.hidden = true;

  hentikanKamera();

  cameraMessage.textContent = "Foto selfie berhasil diambil";
  cameraDescription.textContent =
    "Periksa hasil foto. Jika kurang sesuai, silakan ambil ulang.";

  capturePhotoButton.hidden = true;
  retakePhotoButton.hidden = false;
  startCameraButton.hidden = true;
  perbaruiStatusTombolPresensi();
}

// Mengambil ulang foto
function ambilUlangFoto() {
  capturedPhoto = null;
  perbaruiStatusTombolPresensi();
  capturedImage.src = "";
  capturedImage.hidden = true;

  aktifkanKamera();
}

// Menghubungkan tombol kamera
if (startCameraButton) {
  startCameraButton.addEventListener("click", aktifkanKamera);
}

if (capturePhotoButton) {
  capturePhotoButton.addEventListener("click", ambilFoto);
}

if (retakePhotoButton) {
  retakePhotoButton.addEventListener("click", ambilUlangFoto);
}

// Menghentikan kamera ketika halaman ditinggalkan
window.addEventListener("pagehide", hentikanKamera);

// Menyediakan hasil selfie untuk integrasi tahap selanjutnya
window.PresensiSelfie = {
  getFoto: () => capturedPhoto,
  sudahAmbilFoto: () => Boolean(capturedPhoto),
};

// Mengubah mode tampilan kamera
if (toggleMirrorButton) {
  toggleMirrorButton.addEventListener("click", () => {
    cameraMirror = !cameraMirror;

    cameraVideo.style.transform = cameraMirror ? "scaleX(-1)" : "none";

    toggleMirrorButton.textContent = cameraMirror
      ? "Mode Cermin"
      : "Mode Normal";
  });
}

// Verifikasi lokasi GPS BPKK Kendari

const KOORDINAT_KANTOR = {
  latitude: -3.971474835513989,
  longitude: 122.51448144417957,
};

const BATAS_RADIUS = 500;
let gpsDalamArea = false;

const tombolGPS = document.getElementById("check-location");
const statusGPS = document.getElementById("gps-status");
const jarakGPS = document.getElementById("gps-distance");
const akurasiGPS = document.getElementById("gps-accuracy");
const latitudeGPS = document.getElementById("gps-latitude");
const longitudeGPS = document.getElementById("gps-longitude");
const pesanGPS = document.getElementById("gps-message");

// Menghitung jarak antara dua koordinat
function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = (derajat) => (derajat * Math.PI) / 180;

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Memperbarui tampilan status GPS
function perbaruiStatusGPS(status, pesan) {
  statusGPS.textContent = status;
  statusGPS.dataset.state =
    status === "Di dalam area"
      ? "inside"
      : status === "Di luar area"
      ? "outside"
      : "error";

  pesanGPS.textContent = pesan;
}

// Mengambil lokasi perangkat
function perbaruiLokasi() {
  gpsDalamArea = false;
  perbaruiStatusTombolPresensi();
  if (!navigator.geolocation) {
    perbaruiStatusGPS(
      "Tidak didukung",
      "Browser tidak mendukung fitur lokasi GPS."
    );
    return;
  }

  tombolGPS.disabled = true;
  tombolGPS.textContent = "Mengambil lokasi...";
  perbaruiStatusGPS("Memeriksa...", "Mohon tunggu, lokasi sedang diperiksa.");

  navigator.geolocation.getCurrentPosition(
    (posisi) => {
      const latitude = posisi.coords.latitude;
      const longitude = posisi.coords.longitude;
      const akurasi = posisi.coords.accuracy;

      const jarak = hitungJarak(
        latitude,
        longitude,
        KOORDINAT_KANTOR.latitude,
        KOORDINAT_KANTOR.longitude
      );

      jarakGPS.textContent = Math.round(jarak);
      akurasiGPS.textContent = `±${Math.round(akurasi)} meter`;
      latitudeGPS.textContent = latitude.toFixed(7);
      longitudeGPS.textContent = longitude.toFixed(7);

      if (akurasi > 100) {
        gpsDalamArea = true;
        perbaruiStatusGPS(
          "GPS kurang akurat",
          "Akurasi lokasi masih terlalu rendah. Coba perbarui lokasi di area terbuka."
        );
      } else if (jarak <= BATAS_RADIUS) {
        perbaruiStatusGPS(
          "Di dalam area",
          "Lokasi terdeteksi dalam radius presensi BPKK Kendari."
        );
      } else {
        perbaruiStatusGPS(
          "Di luar area",
          "Lokasi berada di luar radius presensi 500 meter."
        );
      }

      tombolGPS.disabled = false;
      tombolGPS.innerHTML = '<span aria-hidden="true">⊙</span> Perbarui lokasi';
    },
    (error) => {
      let pesan = "Gagal mendapatkan lokasi perangkat.";

      if (error.code === 1) {
        pesan = "Izin lokasi ditolak. Aktifkan izin lokasi pada browser.";
      } else if (error.code === 2) {
        pesan = "Lokasi tidak tersedia. Periksa GPS perangkat.";
      } else if (error.code === 3) {
        pesan = "Waktu pengambilan lokasi habis. Silakan coba kembali.";
      }

      perbaruiStatusGPS("Gagal diperiksa", pesan);
      gpsDalamArea = false;
      perbaruiStatusTombolPresensi();

      tombolGPS.disabled = false;
      tombolGPS.innerHTML = '<span aria-hidden="true">⊙</span> Coba lagi';
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
}

if (tombolGPS) {
  tombolGPS.addEventListener("click", perbaruiLokasi);
}

// Penyimpanan aktivitas harian

const formulirAktivitas = document.querySelector(".activity-form");
const tanggalAktivitas = document.getElementById("activity-date");
const kategoriAktivitas = document.getElementById("activity-category");
const uraianAktivitas = document.getElementById("activity-description");
const konfirmasiAktivitas = document.querySelector(
  'input[name="activity-confirmation"]'
);

const tombolSimpanAktivitas = formulirAktivitas?.querySelector(
  'button[type="button"]'
);

function getKunciAktivitas() {
  return `bpkk-aktivitas-${getTanggalWITA()}`;
}

function simpanAktivitas() {
  if (!formulirAktivitas.reportValidity()) {
    return;
  }

  const aktivitas = {
    tanggal: tanggalAktivitas.value,
    kategori: kategoriAktivitas.value,
    uraian: uraianAktivitas.value.trim(),
    konfirmasi: konfirmasiAktivitas.checked,
    waktuSimpan: new Date().toISOString(),
  };

  if (!aktivitas.uraian) {
    alert("Uraian kegiatan tidak boleh kosong.");
    return;
  }

  localStorage.setItem(getKunciAktivitas(), JSON.stringify(aktivitas));

  alert("Aktivitas harian berhasil disimpan!");

  perbaruiStatusTombolPresensi();
}

function muatAktivitas() {
  const data = localStorage.getItem(getKunciAktivitas());

  if (!data) return;

  try {
    const aktivitas = JSON.parse(data);

    tanggalAktivitas.value = aktivitas.tanggal;
    kategoriAktivitas.value = aktivitas.kategori;
    uraianAktivitas.value = aktivitas.uraian;
    konfirmasiAktivitas.checked = aktivitas.konfirmasi;
  } catch (error) {
    console.error("Gagal membaca aktivitas:", error);
  }
}

if (tombolSimpanAktivitas) {
  tombolSimpanAktivitas.addEventListener("click", simpanAktivitas);
}

muatAktivitas();

// Validasi kelengkapan presensi

const tombolPresensiMasuk = document.getElementById("attendance-checkin");

const tombolPresensiPulang = document.getElementById("attendance-checkout");

// Memeriksa apakah aktivitas hari ini sudah tersimpan
function aktivitasSudahTersimpan() {
  const data = localStorage.getItem(getKunciAktivitas());

  if (!data) return false;

  try {
    const aktivitas = JSON.parse(data);

    return (
      aktivitas.tanggal === getTanggalWITA() &&
      aktivitas.kategori &&
      aktivitas.uraian &&
      aktivitas.konfirmasi === true
    );
  } catch (error) {
    return false;
  }
}

// Memeriksa seluruh persyaratan presensi
function perbaruiStatusTombolPresensi() {
  const dataPresensi = getDataPresensi();

  const selfieSiap =
    window.PresensiSelfie && window.PresensiSelfie.sudahAmbilFoto();

  const aktivitasSiap = aktivitasSudahTersimpan();

  const persyaratanTerpenuhi = selfieSiap && gpsDalamArea && aktivitasSiap;

  const masukSudahTercatat = Boolean(dataPresensi.masuk);
  const pulangSudahTercatat = Boolean(dataPresensi.pulang);

  if (tombolPresensiMasuk) {
    tombolPresensiMasuk.disabled = !persyaratanTerpenuhi || masukSudahTercatat;

    tombolPresensiMasuk.classList.toggle(
      "button-disabled",
      tombolPresensiMasuk.disabled
    );
  }

  if (tombolPresensiPulang) {
    tombolPresensiPulang.disabled = !masukSudahTercatat || pulangSudahTercatat;

    tombolPresensiPulang.classList.toggle(
      "button-disabled",
      tombolPresensiPulang.disabled
    );
  }
}

// Menghubungkan tombol presensi masuk
if (tombolPresensiMasuk) {
  tombolPresensiMasuk.addEventListener("click", () => {
    if (!periksaPersyaratanPresensi()) return;

    const berhasil = simpanWaktuMasuk();

    if (berhasil) {
      alert("Presensi masuk berhasil dicatat!");
      perbaruiStatusTombolPresensi();
    }
  });
}

// Menghubungkan tombol presensi pulang
if (tombolPresensiPulang) {
  tombolPresensiPulang.addEventListener("click", () => {
    const berhasil = simpanWaktuPulang();

    if (berhasil) {
      alert("Presensi pulang berhasil dicatat!");
      perbaruiStatusTombolPresensi();
    }
  });
}

// Memeriksa kembali persyaratan sebelum presensi masuk
function periksaPersyaratanPresensi() {
  if (!window.PresensiSelfie.sudahAmbilFoto()) {
    alert("Silakan ambil foto selfie terlebih dahulu.");
    return false;
  }

  if (!gpsDalamArea) {
    alert("Pastikan lokasi GPS berada dalam radius 500 meter.");
    return false;
  }

  if (!aktivitasSudahTersimpan()) {
    alert("Silakan simpan aktivitas harian terlebih dahulu.");
    return false;
  }

  return true;
}

// Memperbarui tombol ketika halaman dibuka
perbaruiStatusTombolPresensi();
