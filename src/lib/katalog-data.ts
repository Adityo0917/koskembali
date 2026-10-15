import type { StaticImageData } from "next/image";

// Import koleksi gambar langsung dari folder src/lib/Images
import imgKasur from "./Images/Kasur Busa Single Inoac 90x200 cm.png";
import imgMeja from "./Images/Meja Belajar Kayu Minimalis + Rak 2 Tingkat.png";
import imgKipas from "./Images/Kipas Angin Berdiri Miyako 16 Inch.png";
import imgKulkas from "./Images/Kulkas Mini Portable Hisense 42L Hemat Listrik.png";
import imgDispenser from "./Images/Dispenser Air Minum Miyako Galon Atas (Hot & Normal).png";
import imgRakSepatu from "./Images/Rak Sepatu Susun 4 Tingkat Stainless Steel.png";
import imgKursi from "./Images/Kursi Belajar Putar Ergonomis Hidrolik.png";
import imgRiceCooker from "./Images/Rice Cooker Mini Cosmos 0.8L Praktis Kos.png";
import imgLemari from "./Images/Lemari Pakaian Kain Portable Oxford 3 Pintu.png";

export interface KatalogItem {
  id: string;
  nama: string;
  kategori: "perabot" | "elektronik" | "dapur" | "kamar" | "belajar" | "lainnya";
  kondisi: "baru" | "seperti_baru" | "baik" | "layak";
  harga: number;
  keterangan: string;
  gambar?: string | StaticImageData | null; // Mendukung import gambar dari src/lib/Images atau path string seperti "/images/..."
  lynkUrl: string; // URL lynk.id/... yang dapat Anda ganti kapan saja
  kampus?: string;
  status?: "tersedia" | "terjual";
}

/**
 * =========================================================================
 * DAFTAR CONTOH KATALOG BARANG BEKAS KOSKEMBALI
 * =========================================================================
 * PANDUAN MENGGANTI GAMBAR:
 * 
 * Cara 1 (Import dari src/lib/Images):
 * 1. Simpan file gambar Anda di folder: `src/lib/Images/`
 * 2. Lakukan import di bagian atas file ini:
 *    `import imgBaru from "./Images/NamaGambar.png";`
 * 3. Masukkan ke properti `gambar: imgBaru`
 * 
 * Cara 2 (Menggunakan folder public/images):
 * 1. Letakkan gambar di `public/images/nama-gambar.png`
 * 2. Tuliskan path-nya langsung:
 *    `gambar: "/images/nama-gambar.png"`
 * =========================================================================
 */
export const CONTOH_KATALOG: KatalogItem[] = [
  {
    id: "item-001",
    nama: "Kasur Busa Single Inoac 90x200 cm",
    kategori: "kamar",
    kondisi: "seperti_baru",
    harga: 350000,
    keterangan:
      "Busa masih sangat padat dan tidak kempes, bersih terawat tanpa noda. Sudah divakum dan siap diangkut untuk anak kos baru.",
    gambar: imgKasur,
    lynkUrl: "https://lynk.id/koskembali/kasur-busa-single",
    kampus: "Universitas Indonesia",
    status: "tersedia",
  },
  {
    id: "item-002",
    nama: "Meja Belajar Kayu Minimalis + Rak 2 Tingkat",
    kategori: "belajar",
    kondisi: "baik",
    harga: 220000,
    keterangan:
      "Meja belajar kayu partikel tebal ukuran 100x50 cm, kokoh tidak goyang. Terdapat 2 susun rak samping untuk menaruh buku dan perlengkapan kuliah.",
    gambar: imgMeja,
    lynkUrl: "https://lynk.id/koskembali/meja-belajar-kayu",
    kampus: "Institut Teknologi Bandung",
    status: "tersedia",
  },
  {
    id: "item-003",
    nama: "Kipas Angin Berdiri Miyako 16 Inch",
    kategori: "elektronik",
    kondisi: "baik",
    harga: 140000,
    keterangan:
      "Hembusan angin sejuk kencang dengan 3 mode kecepatan. Suara mesin halus, osilasi/swing kiri-kanan lancar normal, kabel utuh.",
    gambar: imgKipas,
    lynkUrl: "https://lynk.id/koskembali/kipas-angin-miyako",
    kampus: "Universitas Gadjah Mada",
    status: "tersedia",
  },
  {
    id: "item-004",
    nama: "Kulkas Mini Portable Hisense 42L Hemat Listrik",
    kategori: "dapur",
    kondisi: "seperti_baru",
    harga: 750000,
    keterangan:
      "Daya listrik sangat irit hanya 45 Watt. Dingin cepat merata, kompartemen freezer mini bekerja optimal untuk es batu. Cocok ditaruh di kamar kos.",
    gambar: imgKulkas,
    lynkUrl: "https://lynk.id/koskembali/kulkas-mini-hisense",
    kampus: "Institut Teknologi Sepuluh Nopember",
    status: "tersedia",
  },
  {
    id: "item-005",
    nama: "Dispenser Air Minum Miyako Galon Atas (Hot & Normal)",
    kategori: "dapur",
    kondisi: "baik",
    harga: 950000,
    keterangan:
      "Kran air panas cepat mendidih sangat praktis untuk menyeduh kopi atau mie instan. Kondisi tabung dalam bersih, bodi luar mulus.",
    gambar: imgDispenser,
    lynkUrl: "https://lynk.id/koskembali/dispenser-air-miyako",
    kampus: "Universitas Padjadjaran",
    status: "tersedia",
  },
  {
    id: "item-006",
    nama: "Rak Sepatu Susun 4 Tingkat Stainless Steel",
    kategori: "perabot",
    kondisi: "seperti_baru",
    harga: 65000,
    keterangan:
      "Pipa stainless tebal anti-karat, muat hingga 12 pasang sepatu dan sandal. Ringan, kokoh, dan mudah dibongkar pasang saat pindahan kos.",
    gambar: imgRakSepatu,
    lynkUrl: "https://lynk.id/koskembali/rak-sepatu-susun",
    kampus: "Universitas Tarumanagara",
    status: "tersedia",
  },
  {
    id: "item-007",
    nama: "Kursi Belajar Putar Ergonomis Hidrolik",
    kategori: "belajar",
    kondisi: "baik",
    harga: 280000,
    keterangan:
      "Sandaran jaring (mesh) berpori sehingga adem dipakai berjam-jam saat mengerjakan tugas/skripsi. Hidrolik naik-turun dan roda putar berfungsi prima.",
    gambar: imgKursi,
    lynkUrl: "https://lynk.id/koskembali/kursi-belajar-putar",
    kampus: "Universitas Indonesia",
    status: "tersedia",
  },
  {
    id: "item-008",
    nama: "Rice Cooker Mini Cosmos 0.8L Praktis Kos",
    kategori: "dapur",
    kondisi: "baik",
    harga: 110000,
    keterangan:
      "Kapasitas pas 0.8 liter untuk 1-2 porsi makan, panci anti lengket masih terawat, fungsi memasak dan menghangatkan bekerja normal.",
    gambar: imgRiceCooker,
    lynkUrl: "https://lynk.id/koskembali/rice-cooker-cosmos",
    kampus: "Universitas Gadjah Mada",
    status: "tersedia",
  },
  {
    id: "item-009",
    nama: "Lemari Pakaian Kain Portable Oxford 3 Pintu",
    kategori: "kamar",
    kondisi: "layak",
    harga: 125000,
    keterangan:
      "Rangka pipa besi kuat dengan cover kain oxford tahan debu. Resleting lancar dan ruang gantungan baju cukup luas untuk pakaian harian.",
    gambar: imgLemari,
    lynkUrl: "https://lynk.id/koskembali/lemari-kain-portable",
    kampus: "Institut Teknologi Bandung",
    status: "tersedia",
  },
];
