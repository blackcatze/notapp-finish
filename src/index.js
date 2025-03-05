import "./style.css";
import Swal from "sweetalert2";
import gsap from "gsap";

const API_URL = "https://notes-api.dicoding.dev/v2/notes";

const daftarCatatan = document.querySelector("#daftar-catatan");
const formCatatan = document.querySelector("#form-catatan");
const judulCatatan = document.querySelector("#judul-catatan");
const isiCatatan = document.querySelector("#isi-catatan");
const loadingElemen = document.querySelector("#loading");

if (!daftarCatatan || !formCatatan || !judulCatatan || !isiCatatan) {
  console.error("Elemen tidak ditemukan! Periksa index.html.");
}

gsap.from(".note", { opacity: 0, duration: 1, y: -50 });

function tampilkanLoading() {
  loadingElemen.style.display = "block";
}

function sembunyikanLoading() {
  loadingElemen.style.display = "none";
}

async function ambilCatatan() {
  tampilkanLoading();
  daftarCatatan.innerHTML = "";

  try {
    const response = await fetch(API_URL);
    const hasil = await response.json();
    sembunyikanLoading();

    if (!response.ok) {
      throw new Error(hasil.message);
    }

    daftarCatatan.innerHTML = "";
    hasil.data.forEach((catatan) => {
      const elemenCatatan = buatElemenCatatan(catatan);
      daftarCatatan.appendChild(elemenCatatan);

      gsap.from(elemenCatatan, { opacity: 0, y: 20, duration: 0.5 });
    });
  } catch (error) {
    sembunyikanLoading();
    daftarCatatan.innerHTML = `<p class="error">Gagal memuat catatan</p>`;
    Swal.fire("Error", "Gagal mengambil data catatan.", "error");
  }
}

function buatElemenCatatan(catatan) {
  const elemenCatatan = document.createElement("div");
  elemenCatatan.classList.add("note-item");

  const titleElement = document.createElement("h3");
  titleElement.textContent = catatan.title;

  const contentElement = document.createElement("p");
  contentElement.textContent = catatan.body;

  const tombolArsip = document.createElement("button");
  tombolArsip.innerText = "Arsipkan";
  tombolArsip.classList.add("btn", "btn-archive");
  tombolArsip.addEventListener("click", async () => {
    await arsipkanCatatan(catatan.id);
    ambilCatatan();
  });

  const tombolHapus = document.createElement("button");
  tombolHapus.innerText = "Hapus";
  tombolHapus.classList.add("btn", "btn-delete");
  tombolHapus.addEventListener("click", async () => {
    await hapusCatatan(catatan.id);
    ambilCatatan();
  });

  elemenCatatan.appendChild(titleElement);
  elemenCatatan.appendChild(contentElement);
  elemenCatatan.appendChild(tombolArsip);
  elemenCatatan.appendChild(tombolHapus);

  return elemenCatatan;
}

async function arsipkanCatatan(idCatatan) {
  try {
    const response = await fetch(`${API_URL}/${idCatatan}/archive`, { method: "POST" });
    if (!response.ok) throw new Error("Gagal mengarsipkan catatan");
    Swal.fire("Sukses", "Catatan berhasil diarsipkan!", "success");
  } catch (error) {
    Swal.fire("Error", "Gagal mengarsipkan catatan", "error");
  }
}

async function hapusCatatan(idCatatan) {
  try {
    const response = await fetch(`${API_URL}/${idCatatan}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Gagal menghapus catatan");
    Swal.fire("Sukses", "Catatan berhasil dihapus!", "success");
  } catch (error) {
    Swal.fire("Error", "Gagal menghapus catatan", "error");
  }
}

formCatatan.addEventListener("submit", async function (event) {
  event.preventDefault();
  const catatanBaru = {
    title: judulCatatan.value,
    body: isiCatatan.value,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catatanBaru),
    });

    if (!response.ok) throw new Error("Gagal menambahkan catatan");
    judulCatatan.value = "";
    isiCatatan.value = "";
    Swal.fire("Sukses", "Catatan berhasil ditambahkan!", "success");
    ambilCatatan();
  } catch (error) {
    Swal.fire("Error", "Gagal menambahkan catatan", "error");
  }
});

document.addEventListener("DOMContentLoaded", ambilCatatan);
