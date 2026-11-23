/**
 * Konfigurasi Pemetaan Field Identitas & Field Khusus per Jenis Surat
 * Digunakan untuk formulir dinamis permohonan surat di SiDesaku
 */

export const LETTER_FIELD_CONFIGS = {
  // 1. Surat Keterangan Domisili (SKD)
  SKD: {
    nama: 'Surat Keterangan Domisili',
    fieldsKhusus: [
      {
        name: 'alamat_domisili',
        label: 'Alamat Domisili Tempat Tinggal Saat Ini',
        type: 'textarea',
        required: true,
        placeholder: 'Contoh: Dusun Makmur Jaya RT 02 / RW 01, Desa Makmur...',
        helper: 'Alamat fisik tempat warga tinggal saat ini di wilayah desa.',
      },
      {
        name: 'tinggal_sejak',
        label: 'Tinggal di Alamat Ini Sejak (Tahun / Tanggal)',
        type: 'text',
        required: false,
        placeholder: 'Contoh: Tahun 2019 / Sejak lahir',
        helper: 'Keterangan waktu mulai menetap di alamat domisili tersebut.',
      },
    ],
  },

  // 2. Surat Keterangan Usaha (SKU)
  SKU: {
    nama: 'Surat Keterangan Usaha',
    fieldsKhusus: [
      {
        name: 'nama_usaha',
        label: 'Nama Usaha / Toko / Unit Usaha',
        type: 'text',
        required: true,
        placeholder: 'Contoh: Toko Berkah Sembako / Bengkel Maju Motor',
        helper: 'Nama dagang atau merek usaha milik pemohon.',
      },
      {
        name: 'bidang_usaha',
        label: 'Bidang / Jenis Usaha',
        type: 'text',
        required: true,
        placeholder: 'Contoh: Perdagangan Bahan Pokok, Jasa Servis, Kuliner, dll.',
        helper: 'Sektor atau komoditas utama yang dijalankan.',
      },
      {
        name: 'alamat_usaha',
        label: 'Alamat / Lokasi Operasional Usaha',
        type: 'textarea',
        required: true,
        placeholder: 'Contoh: Jl. Raya Desa No. 15, RT 01 RW 02...',
        helper: 'Lokasi tempat kegiatan usaha berlangsung di wilayah desa.',
      },
      {
        name: 'tahun_berdiri',
        label: 'Mulai Berjalan Sejak (Tahun)',
        type: 'text',
        required: false,
        placeholder: 'Contoh: 2021',
        helper: 'Tahun dimulainya kegiatan usaha.',
      },
    ],
  },

  // 3. Surat Pengantar RT/RW & KTP (SP / SPKTP)
  SPKTP: {
    nama: 'Surat Pengantar KTP / RT/RW',
    fieldsKhusus: [
      {
        name: 'tujuan_pengantar',
        label: 'Instansi / Tujuan Surat Pengantar',
        type: 'text',
        required: true,
        placeholder: 'Contoh: Kantor Kecamatan Sukamaju (Perekaman KTP-el Baru / Penggantian Rusak)',
        helper: 'Instansi tujuan atau keperluan pengurusan surat pengantar.',
      },
      {
        name: 'no_pengantar_rt',
        label: 'Nomor Surat Pengantar dari RT/RW (Jika Ada)',
        type: 'text',
        required: false,
        placeholder: 'Contoh: 005/RT.01/XI/2026',
        helper: 'Nomor berkas pengantar dari rukun tetangga tempat pemohon berdomisili.',
      },
      {
        name: 'keterangan_tambahan',
        label: 'Keterangan Pengantar Tambahan',
        type: 'text',
        required: false,
        placeholder: 'Contoh: Mengurus KTP pertama kali / KTP hilang',
        helper: 'Penjelasan singkat latar belakang pengurusan.',
      },
    ],
  },

  // 4. Surat Keterangan Tidak Mampu (SKTM)
  SKTM: {
    nama: 'Surat Keterangan Tidak Mampu',
    fieldsKhusus: [
      {
        name: 'penghasilan_bulanan',
        label: 'Penghasilan Rata-rata per Bulan',
        type: 'text',
        required: false,
        placeholder: 'Contoh: Rp 800.000 / Kurang dari Rp 1.000.000',
        helper: 'Estimasi pendapatan atau penghasilan rata-rata per bulan pemohon.',
      },
      {
        name: 'jumlah_tanggungan',
        label: 'Jumlah Tanggungan Keluarga',
        type: 'text',
        required: false,
        placeholder: 'Contoh: 3 orang',
        helper: 'Jumlah anggota keluarga yang menjadi tanggungan pemohon.',
      },
      {
        name: 'keterangan_tambahan',
        label: 'Keterangan Tambahan / Alasan Permohonan',
        type: 'textarea',
        required: false,
        placeholder: 'Contoh: Untuk persyaratan pendaftaran beasiswa KIP Kuliah / keringanan biaya pengobatan di rumah sakit...',
        helper: 'Penjelasan tambahan keperluan dan latar belakang permohonan SKTM.',
      },
    ],
  },
};

/**
 * Mendapatkan konfigurasi field khusus berdasarkan kode surat (SKD, SKU, SPKTP, SKTM) atau nama surat
 */
export function getLetterConfig(kodeSurat = '', namaSurat = '') {
  const code = (kodeSurat || '').toUpperCase();
  const name = (namaSurat || '').toLowerCase();

  if (code.startsWith('SKD') || name.includes('domisili')) {
    return LETTER_FIELD_CONFIGS.SKD;
  }
  if (code.startsWith('SKU') || name.includes('usaha')) {
    return LETTER_FIELD_CONFIGS.SKU;
  }
  if (code.startsWith('SKTM') || name.includes('tidak mampu')) {
    return LETTER_FIELD_CONFIGS.SKTM;
  }
  if (code.startsWith('SP') || name.includes('pengantar')) {
    return LETTER_FIELD_CONFIGS.SPKTP;
  }

  // Default fallback jika jenis surat lain
  return {
    nama: namaSurat || 'Surat Keterangan',
    fieldsKhusus: [],
  };
}
