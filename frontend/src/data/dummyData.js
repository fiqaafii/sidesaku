// ============================================================
// DATA DUMMY — HANYA UNTUK PROTOTIPE UI/UX
// Akan diganti dengan data dari API backend pada Tahap 6.
// ============================================================

export const DUMMY_NOTICE = '⚠️ DATA DEMO — Bukan data nyata. Akan terhubung ke database pada Tahap 6.';

// ── Kecamatan & Desa ──────────────────────────────────────
export const dummyKecamatan = {
  id_kecamatan: 1,
  nama_kecamatan: 'Kecamatan Sukamaju',
  kode_kecamatan: 'KEC-001',
};

export const dummyDesaList = [
  {
    id_desa: 1,
    nama_desa: 'Desa Makmur',
    kode_desa: 'DSA-001',
    alamat_kantor: 'Jl. Raya Makmur No. 1, RT 01/RW 01',
    telepon: '0812-3456-7890',
    email: 'desa.makmur@sukamaju.go.id',
    status: 'aktif',
    id_kecamatan: 1,
  },
  {
    id_desa: 2,
    nama_desa: 'Desa Sejahtera',
    kode_desa: 'DSA-002',
    alamat_kantor: 'Jl. Sejahtera Bersama No. 5, RT 02/RW 01',
    telepon: '0813-9876-5432',
    email: 'desa.sejahtera@sukamaju.go.id',
    status: 'aktif',
    id_kecamatan: 1,
  },
  {
    id_desa: 3,
    nama_desa: 'Desa Harapan',
    kode_desa: 'DSA-003',
    alamat_kantor: 'Jl. Harapan Baru No. 12',
    telepon: '0821-1122-3344',
    email: 'desa.harapan@sukamaju.go.id',
    status: 'nonaktif',
    id_kecamatan: 1,
  },
];

// ── Users / Akun ──────────────────────────────────────────
export const dummyPendingAdmins = [
  {
    id_user: 10,
    nama_lengkap: 'Budi Santoso',
    username: 'budi.santoso',
    email: 'budi@example.com',
    nama_desa: 'Desa Makmur',
    status_akun: 'menunggu',
    created_at: '2026-10-20T08:30:00Z',
  },
  {
    id_user: 11,
    nama_lengkap: 'Siti Rahayu',
    username: 'siti.rahayu',
    email: 'siti@example.com',
    nama_desa: 'Desa Sejahtera',
    status_akun: 'menunggu',
    created_at: '2026-10-22T14:15:00Z',
  },
];

export const dummyActiveAdmins = [
  {
    id_user: 5,
    nama_lengkap: 'Ahmad Fauzi',
    username: 'admin.makmur',
    email: 'admin.makmur@example.com',
    nama_desa: 'Desa Makmur',
    status_akun: 'aktif',
  },
  {
    id_user: 6,
    nama_lengkap: 'Dewi Kusuma',
    username: 'admin.sejahtera',
    email: 'admin.sejahtera@example.com',
    nama_desa: 'Desa Sejahtera',
    status_akun: 'aktif',
  },
];

// ── Jenis Surat ───────────────────────────────────────────
export const dummyJenisSurat = [
  {
    id_jenis_surat: 1,
    nama_surat: 'Surat Keterangan Domisili',
    kode_surat: 'SKD',
    deskripsi: 'Surat keterangan tempat tinggal/domisili warga',
    status: 'aktif',
    jumlah_persyaratan: 3,
  },
  {
    id_jenis_surat: 2,
    nama_surat: 'Surat Keterangan Usaha',
    kode_surat: 'SKU',
    deskripsi: 'Surat keterangan bagi pelaku usaha di desa',
    status: 'aktif',
    jumlah_persyaratan: 4,
  },
  {
    id_jenis_surat: 3,
    nama_surat: 'Surat Keterangan Tidak Mampu',
    kode_surat: 'SKTM',
    deskripsi: 'Surat keterangan untuk warga kurang mampu',
    status: 'aktif',
    jumlah_persyaratan: 5,
  },
  {
    id_jenis_surat: 4,
    nama_surat: 'Surat Pengantar KTP',
    kode_surat: 'SPKTP',
    deskripsi: 'Surat pengantar untuk pembuatan atau perpanjangan KTP',
    status: 'aktif',
    jumlah_persyaratan: 2,
  },
];

// ── Permohonan Surat ──────────────────────────────────────
export const dummyPermohonan = [
  {
    id_permohonan: 1,
    nomor_permohonan: 'PMH-2026-0001',
    nama_warga: 'Rudi Hermawan',
    nama_surat: 'Surat Keterangan Domisili',
    tanggal_pengajuan: '2026-10-25T09:00:00Z',
    status: 'diajukan',
    keperluan: 'Keperluan melamar pekerjaan',
  },
  {
    id_permohonan: 2,
    nomor_permohonan: 'PMH-2026-0002',
    nama_warga: 'Rina Lestari',
    nama_surat: 'Surat Keterangan Usaha',
    tanggal_pengajuan: '2026-10-24T13:30:00Z',
    status: 'diproses',
    keperluan: 'Untuk mengurus izin UMKM',
  },
  {
    id_permohonan: 3,
    nomor_permohonan: 'PMH-2026-0003',
    nama_warga: 'Hendra Wijaya',
    nama_surat: 'Surat Keterangan Tidak Mampu',
    tanggal_pengajuan: '2026-10-23T10:15:00Z',
    status: 'perlu_perbaikan',
    keperluan: 'Beasiswa pendidikan anak',
  },
  {
    id_permohonan: 4,
    nomor_permohonan: 'PMH-2026-0004',
    nama_warga: 'Sari Dewi',
    nama_surat: 'Surat Pengantar KTP',
    tanggal_pengajuan: '2026-10-22T08:45:00Z',
    status: 'disetujui',
    keperluan: 'Perpanjangan KTP',
  },
  {
    id_permohonan: 5,
    nomor_permohonan: 'PMH-2026-0005',
    nama_warga: 'Agus Salim',
    nama_surat: 'Surat Keterangan Domisili',
    tanggal_pengajuan: '2026-10-20T14:20:00Z',
    status: 'selesai',
    keperluan: 'Persyaratan kredit bank',
  },
  {
    id_permohonan: 6,
    nomor_permohonan: 'PMH-2026-0006',
    nama_warga: 'Yanti Puspita',
    nama_surat: 'Surat Keterangan Usaha',
    tanggal_pengajuan: '2026-10-19T11:00:00Z',
    status: 'ditolak',
    keperluan: 'Persyaratan pinjaman koperasi',
  },
];

// Permohonan milik warga yang sedang login (dummy)
export const dummyPermohonanWarga = [
  {
    id_permohonan: 7,
    nomor_permohonan: 'PMH-2026-0007',
    nama_surat: 'Surat Keterangan Domisili',
    tanggal_pengajuan: '2026-10-26T10:00:00Z',
    status: 'diajukan',
    keperluan: 'Keperluan pendaftaran sekolah',
    catatan_admin: null,
  },
  {
    id_permohonan: 8,
    nomor_permohonan: 'PMH-2026-0008',
    nama_surat: 'Surat Keterangan Tidak Mampu',
    tanggal_pengajuan: '2026-10-15T09:30:00Z',
    status: 'perlu_perbaikan',
    keperluan: 'Beasiswa kuliah',
    catatan_admin: 'Mohon unggah ulang fotokopi KTP yang lebih jelas. File sebelumnya terlalu buram.',
  },
  {
    id_permohonan: 9,
    nomor_permohonan: 'PMH-2026-0009',
    nama_surat: 'Surat Pengantar KTP',
    tanggal_pengajuan: '2026-10-10T14:00:00Z',
    status: 'selesai',
    keperluan: 'Pembuatan KTP baru',
    catatan_admin: null,
  },
];

// ── Riwayat Permohonan ────────────────────────────────────
export const dummyRiwayat = [
  {
    id_riwayat: 1,
    status_sebelumnya: null,
    status_baru: 'diajukan',
    keterangan: 'Permohonan berhasil diajukan oleh warga.',
    nama_user: 'Rudi Hermawan',
    tanggal_perubahan: '2026-10-26T10:00:00Z',
  },
  {
    id_riwayat: 2,
    status_sebelumnya: 'diajukan',
    status_baru: 'diproses',
    keterangan: 'Permohonan sedang diperiksa oleh Admin Desa.',
    nama_user: 'Ahmad Fauzi (Admin)',
    tanggal_perubahan: '2026-10-26T14:30:00Z',
  },
  {
    id_riwayat: 3,
    status_sebelumnya: 'diproses',
    status_baru: 'perlu_perbaikan',
    keterangan: 'Fotokopi KTP terlalu buram. Mohon unggah ulang.',
    nama_user: 'Ahmad Fauzi (Admin)',
    tanggal_perubahan: '2026-10-27T08:15:00Z',
  },
];

// ── Statistik Dashboard ───────────────────────────────────
export const dummyStatsAdmin = {
  total_permohonan: 24,
  diajukan: 5,
  diproses: 8,
  perlu_perbaikan: 3,
  disetujui: 4,
  selesai: 3,
  ditolak: 1,
};

export const dummyStatsSuperAdmin = {
  total_desa: 3,
  desa_aktif: 2,
  total_admin: 4,
  admin_menunggu: 2,
  admin_aktif: 2,
  total_permohonan_bulan_ini: 47,
};

export const dummyStatsWarga = {
  total_permohonan: 3,
  aktif: 2,
  selesai: 1,
};
