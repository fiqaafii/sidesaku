import PDFDocument from 'pdfkit';
import fs from 'fs';

// ─── Helpers Pembersihan Prefix & Format ─────────────────────────────────────

function formatTanggalID(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Menghilangkan duplikasi kata depan (misal: "Desa Makmur" -> "Makmur")
function stripPrefix(str, prefix) {
  if (!str) return '';
  return str.trim().replace(new RegExp('^' + prefix + '\\s+', 'i'), '').trim();
}

function cleanKabupaten(kab) {
  const clean = stripPrefix(kab, 'Kabupaten');
  return clean ? `PEMERINTAH KABUPATEN ${clean.toUpperCase()}` : '';
}

function cleanKecamatan(kec) {
  const clean = stripPrefix(kec, 'Kecamatan');
  return clean ? `KECAMATAN ${clean.toUpperCase()}` : '';
}

function cleanKantorDesa(desa) {
  const clean = stripPrefix(desa, 'Desa');
  return clean ? `KANTOR DESA ${clean.toUpperCase()}` : 'KANTOR DESA';
}

function cleanNamaDesa(desa) {
  return stripPrefix(desa, 'Desa');
}

function cleanNamaKecamatan(kec) {
  return stripPrefix(kec, 'Kecamatan');
}

function cleanNamaKabupaten(kab) {
  return stripPrefix(kab, 'Kabupaten');
}

function cleanJabatan(jabatan) {
  return jabatan ? jabatan.trim() : 'Kepala Desa';
}

// ─── generateOfficialSuratPDF (Generik / Fallback Non-SKD) ───────────────────

/**
 * Membuat dokumen PDF resmi surat permohonan generik yang disetujui
 */
export function generateOfficialSuratPDF({
  nomorPermohonan,
  nomorSurat,
  namaSurat,
  kodeSurat,
  keperluan,
  warga,
  desa,
  kecamatan,
  tanggalSelesai,
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 35, bottom: 35, left: 55, right: 55 },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageW = 595.28;
      const marginL = 55;
      const marginR = 55;
      const contentW = pageW - marginL - marginR;

      // 1. KOP SURAT PEMERINTAH DESA
      const namaKabText = cleanKabupaten(desa?.nama_kabupaten);
      const namaKecText = cleanKecamatan(kecamatan?.nama_kecamatan);
      const namaDesaText = cleanKantorDesa(desa?.nama_desa);

      if (namaKabText) {
        doc.fontSize(10).font('Helvetica-Bold').text(namaKabText, { align: 'center' });
      }
      if (namaKecText) {
        doc.fontSize(10).font('Helvetica-Bold').text(namaKecText, { align: 'center' });
      }
      doc.fontSize(13).font('Helvetica-Bold').text(namaDesaText, { align: 'center' });
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Alamat : ${desa?.alamat_kantor || 'Jalan Raya Desa'}${desa?.telepon ? ' | Telp: ' + desa.telepon : ''}${desa?.email ? ' | Email: ' + desa.email : ''}`,
          { align: 'center' }
        );

      doc.moveDown(0.4);

      // Garis ganda kop surat
      const yLine = doc.y;
      doc.lineWidth(1.75).moveTo(marginL, yLine).lineTo(pageW - marginR, yLine).stroke();
      doc.lineWidth(0.5).moveTo(marginL, yLine + 2.5).lineTo(pageW - marginR, yLine + 2.5).stroke();

      doc.y = yLine + 12;

      // 2. JUDUL DAN NOMOR SURAT
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text((namaSurat || 'SURAT KETERANGAN').toUpperCase(), { align: 'center', underline: true });

      doc.moveDown(0.3);

      const nomorLabel = nomorSurat ? `Nomor : ${nomorSurat}` : `Nomor : ${nomorPermohonan || '...................................................'}`;
      doc.fontSize(10).font('Helvetica').text(nomorLabel, { align: 'center' });

      doc.moveDown(1.2);

      // 3. KALIMAT PEMBUKA
      const desaClean = cleanNamaDesa(desa?.nama_desa);
      const kecClean = cleanNamaKecamatan(kecamatan?.nama_kecamatan);
      const jabatanClean = cleanJabatan(desa?.jabatan_pejabat);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          `Yang bertanda tangan di bawah ini ${jabatanClean} ${desaClean}, Kecamatan ${kecClean}, dengan ini menerangkan dengan sebenarnya bahwa:`,
          { align: 'justify', lineGap: 3 }
        );

      doc.moveDown(0.8);

      // 4. IDENTITAS WARGA PEMOHON
      const startX = marginL + 15;
      const labelWidth = 140;
      const colonX = startX + labelWidth;
      const valueX = colonX + 15;

      const citizenFields = [
        ['Nama Lengkap', warga?.nama_lengkap || '-'],
        ['NIK (No. KTP)', warga?.nik || '-'],
        ['Nomor Telepon', warga?.no_telepon || '-'],
        ['Alamat Tempat Tinggal', warga?.alamat || '-'],
        ['Desa / Kelurahan', `Desa ${desaClean}`],
        ['Kecamatan', `Kecamatan ${kecClean}`],
      ];

      for (const [label, val] of citizenFields) {
        const curY = doc.y;
        doc.font('Helvetica').fontSize(10).text(label, startX, curY);
        doc.text(':', colonX, curY);
        doc.text(val, valueX, curY, { width: 310 });
        doc.moveDown(0.5);
      }

      doc.moveDown(0.8);

      // 5. ISI PERNYATAAN / KEPERLUAN SURAT
      doc
        .font('Helvetica')
        .fontSize(10)
        .text(
          `Berdasarkan data kependudukan yang tercatat pada sistem administrasi desa, orang yang bersangkutan adalah benar-benar warga penduduk yang berdomisili sah di Desa ${desaClean}.`,
          { align: 'justify', lineGap: 3 }
        );

      doc.moveDown(0.6);

      doc.text(
        `Surat keterangan ini diterbitkan dan diberikan kepada pemohon untuk dipergunakan sesuai dengan keperluan: "${keperluan || 'Keperluan administrasi warga'}".`,
        { align: 'justify', lineGap: 2 }
      );

      doc.moveDown(0.6);

      // 6. PENUTUP
      doc
        .font('Helvetica')
        .fontSize(10)
        .text(
          `Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.`,
          { align: 'justify', lineGap: 3 }
        );

      doc.moveDown(1.5);

      // 7. KOLOM TANDA TANGAN BASAH KEPALA DESA
      const tglFormatted = tanggalSelesai ? formatTanggalID(tanggalSelesai) : formatTanggalID(new Date());
      const ttdBoxW = 200;
      const ttdX = pageW - marginR - ttdBoxW;

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`${desaClean}, ${tglFormatted}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' })
        .moveDown(0.3)
        .text(`${jabatanClean} ${desaClean}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' })
        .moveDown(3.8)
        .font('Helvetica-Bold')
        .text((desa?.nama_kepala_desa || 'KEPALA DESA').toUpperCase(), ttdX, doc.y, { width: ttdBoxW, align: 'center', underline: true })
        .font('Helvetica')
        .fontSize(8)
        .moveDown(0.2)
        .text('(Tanda tangan basah & stempel resmi)', ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── generateSKDPDF (Surat Keterangan Domisili Resmi) ─────────────────────────

/**
 * Menghasilkan PDF Surat Keterangan Domisili (SKD) resmi.
 * Format rapi, tata letak seimbang 1 halaman A4 portrait, tanpa pengulangan kata.
 *
 * @param {object} opts
 * @param {string}  opts.nomor_surat     - Nomor surat resmi (mis. "001/SKD/XI/2026")
 * @param {object}  opts.warga           - Data warga: nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pekerjaan, alamat, rt, rw
 * @param {object}  opts.desa            - Data desa: nama_desa, nama_kabupaten, nama_kepala_desa, jabatan_pejabat, alamat_kantor, telepon, email, logo_desa
 * @param {object}  opts.kecamatan       - Data kecamatan: nama_kecamatan
 * @param {object}  opts.data_khusus     - JSON data_khusus_surat: alamat_domisili, tinggal_sejak
 * @param {Date}    opts.tanggal_terbit  - Tanggal penerbitan surat
 * @param {string}  opts.keperluan       - Keperluan permohonan
 * @returns {Promise<Buffer>}            - PDF Buffer
 */
export function generateSKDPDF({ nomor_surat, warga, desa, kecamatan, data_khusus, tanggal_terbit, keperluan }) {
  // Validasi data penting sebelum generate
  const missing = [];
  if (!desa?.nama_kepala_desa) missing.push('Nama Kepala Desa (profil desa)');
  if (!desa?.jabatan_pejabat) missing.push('Jabatan Pejabat (profil desa)');
  if (!desa?.nama_kabupaten) missing.push('Nama Kabupaten (profil desa)');
  if (!warga?.nama_lengkap) missing.push('Nama Lengkap Warga');
  if (!warga?.nik) missing.push('NIK Warga');

  if (missing.length > 0) {
    return Promise.reject(
      Object.assign(new Error('Data surat tidak lengkap: ' + missing.join(', ')), {
        missingFields: missing,
        statusCode: 422,
      })
    );
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 35, bottom: 35, left: 55, right: 55 },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageW = 595.28;
      const marginL = 55;
      const marginR = 55;
      const contentW = pageW - marginL - marginR;

      // ── 1. KOP SURAT RESMI ────────────────────────────────────────────────
      const kopStartY = 35;
      let textColX = marginL;
      let textColW = contentW;

      // Logo desa (opsional di sebelah kiri jika berkas ada)
      if (desa.logo_desa && fs.existsSync(desa.logo_desa)) {
        try {
          doc.image(desa.logo_desa, marginL, kopStartY, { width: 55, height: 55 });
          textColX = marginL + 65;
          textColW = contentW - 65;
        } catch (_) {
          // Abaikan jika berkas gambar rusak
        }
      }

      const kabKop = cleanKabupaten(desa.nama_kabupaten);
      const kecKop = cleanKecamatan(kecamatan?.nama_kecamatan);
      const desaKop = cleanKantorDesa(desa.nama_desa);

      if (kabKop) {
        doc.font('Helvetica-Bold').fontSize(10).text(kabKop, textColX, kopStartY, { width: textColW, align: 'center' });
      }
      if (kecKop) {
        doc.fontSize(10).text(kecKop, { width: textColW, align: 'center' });
      }
      doc.fontSize(13).text(desaKop, { width: textColW, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(8)
        .text(
          `Alamat : ${desa.alamat_kantor || 'Jalan Raya Desa'}${desa.telepon ? ' | Telp: ' + desa.telepon : ''}${desa.email ? ' | Email: ' + desa.email : ''}`,
          textColX,
          doc.y,
          { width: textColW, align: 'center' }
        );

      // Garis ganda pemisah kop surat
      const yLine = Math.max(doc.y + 6, kopStartY + 64);
      doc.lineWidth(1.75).moveTo(marginL, yLine).lineTo(pageW - marginR, yLine).stroke();
      doc.lineWidth(0.5).moveTo(marginL, yLine + 2.5).lineTo(pageW - marginR, yLine + 2.5).stroke();

      doc.y = yLine + 12;

      // ── 2. JUDUL DAN NOMOR SURAT ──────────────────────────────────────────
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('SURAT KETERANGAN DOMISILI', marginL, doc.y, { width: contentW, align: 'center', underline: true });

      doc.moveDown(0.3);

      const nomorTampil = nomor_surat
        ? `Nomor : ${nomor_surat}`
        : 'Nomor : ......... / SKD / ......... / ' + new Date().getFullYear();

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(nomorTampil, marginL, doc.y, { width: contentW, align: 'center' });

      doc.moveDown(1.0);

      // ── 3. DATA PEJABAT PENANDATANGAN ──────────────────────────────────────
      const namaDesaClean = cleanNamaDesa(desa.nama_desa);
      const namaKecClean = cleanNamaKecamatan(kecamatan?.nama_kecamatan);
      const namaKabClean = cleanNamaKabupaten(desa.nama_kabupaten);
      const jabatanClean = cleanJabatan(desa.jabatan_pejabat);

      const labelX = marginL + 15;
      const colonX = labelX + 130;
      const valueX = colonX + 15;
      const valueW = pageW - marginR - valueX;

      function drawRow(label, value) {
        const y = doc.y;
        doc.font('Helvetica').fontSize(10).text(label, labelX, y);
        doc.text(':', colonX, y);
        doc.text(value || '-', valueX, y, { width: valueW });
        doc.moveDown(0.5);
      }

      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Yang bertanda tangan di bawah ini:', marginL, doc.y);
      doc.moveDown(0.4);

      drawRow('Nama', desa.nama_kepala_desa || '-');
      drawRow('Jabatan', `${jabatanClean} ${namaDesaClean}`);
      drawRow('Alamat', desa.alamat_kantor || `Kantor Desa ${namaDesaClean}`);

      doc.moveDown(0.6);

      // ── 4. DATA IDENTITAS WARGA PEMOHON ────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Menerangkan dengan sebenarnya bahwa:', marginL, doc.y);
      doc.moveDown(0.4);

      // Tempat, Tanggal Lahir
      const ttl = [warga.tempat_lahir, formatTanggalID(warga.tanggal_lahir)]
        .filter(Boolean)
        .join(', ') || '-';

      // Format RT/RW
      let rtRw = '-';
      if (warga.rt || warga.rw) {
        rtRw = `RT ${warga.rt || '-'} / RW ${warga.rw || '-'}`;
      }

      // Alamat tempat tinggal / domisili
      const alamatDomisili = data_khusus?.alamat_domisili || warga.alamat || '-';

      drawRow('Nama Lengkap', warga.nama_lengkap || '-');
      drawRow('NIK', warga.nik || '-');
      drawRow('Tempat, Tanggal Lahir', ttl);
      if (warga.jenis_kelamin) {
        const jkLabel = warga.jenis_kelamin === 'L' ? 'Laki-laki' : warga.jenis_kelamin === 'P' ? 'Perempuan' : warga.jenis_kelamin;
        drawRow('Jenis Kelamin', jkLabel);
      }
      if (warga.pekerjaan) {
        drawRow('Pekerjaan', warga.pekerjaan);
      }
      drawRow('Alamat Domisili', alamatDomisili);
      if (rtRw !== '-') {
        drawRow('RT / RW', rtRw);
      }
      drawRow('Desa / Kelurahan', `Desa ${namaDesaClean}`);
      drawRow('Kecamatan', `Kecamatan ${namaKecClean}`);
      if (namaKabClean) {
        drawRow('Kabupaten', `Kabupaten ${namaKabClean}`);
      }

      doc.moveDown(0.6);

      // ── 5. BADAN SURAT / PERNYATAAN DOMISILI ──────────────────────────────
      let redaksiPernyataan =
        `Orang yang bersangkutan adalah benar warga penduduk yang bertempat tinggal dan berdomisili di Desa ${namaDesaClean}, Kecamatan ${namaKecClean}, Kabupaten ${namaKabClean}.`;
      if (data_khusus?.tinggal_sejak) {
        redaksiPernyataan += ` Berdasarkan catatan kependudukan kami, yang bersangkutan telah tinggal di alamat tersebut sejak ${data_khusus.tinggal_sejak}.`;
      }

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(redaksiPernyataan, marginL, doc.y, { align: 'justify', width: contentW, lineGap: 2 });

      doc.moveDown(0.5);

      if (keperluan) {
        doc.text(
          `Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan: ${keperluan}.`,
          marginL,
          doc.y,
          { align: 'justify', width: contentW, lineGap: 2 }
        );
        doc.moveDown(0.5);
      }

      doc.text(
        'Demikian Surat Keterangan Domisili ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.',
        marginL,
        doc.y,
        { align: 'justify', width: contentW, lineGap: 2 }
      );

      doc.moveDown(1.2);

      // ── 6. BLOK TANDA TANGAN PEJABAT ──────────────────────────────────────
      const tglTerbit = tanggal_terbit ? formatTanggalID(tanggal_terbit) : formatTanggalID(new Date());
      const ttdBoxW = 210;
      const ttdX = pageW - marginR - ttdBoxW;

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(`${namaKabClean ? `Kabupaten ${namaKabClean}` : namaDesaClean}, ${tglTerbit}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.moveDown(0.25);
      doc
        .text(`${jabatanClean} ${namaDesaClean}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.moveDown(3.8); // Ruang untuk pembubuhan tanda tangan basah & stempel resmi

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text((desa.nama_kepala_desa || '').toUpperCase(), ttdX, doc.y, { width: ttdBoxW, align: 'center', underline: true });

      doc.moveDown(0.25);
      doc
        .font('Helvetica')
        .fontSize(8)
        .text('(Tanda tangan basah & stempel resmi)', ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── generateSKUPDF (Surat Keterangan Usaha Resmi) ───────────────────────────

/**
 * Menghasilkan PDF Surat Keterangan Usaha (SKU) resmi.
 * Format rapi, tata letak seimbang 1 halaman A4 portrait, tanpa pengulangan kata.
 *
 * @param {object} opts
 * @param {string}  opts.nomor_surat     - Nomor surat resmi (mis. "001/SKU/XI/2026")
 * @param {object}  opts.warga           - Data warga: nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pekerjaan, alamat, rt, rw
 * @param {object}  opts.desa            - Data desa: nama_desa, nama_kabupaten, nama_kepala_desa, jabatan_pejabat, alamat_kantor, telepon, email, logo_desa
 * @param {object}  opts.kecamatan       - Data kecamatan: nama_kecamatan
 * @param {object}  opts.data_khusus     - JSON data_khusus_surat: nama_usaha, bidang_usaha, alamat_usaha, tahun_berdiri
 * @param {Date}    opts.tanggal_terbit  - Tanggal penerbitan surat
 * @param {string}  opts.keperluan       - Keperluan permohonan
 * @returns {Promise<Buffer>}            - PDF Buffer
 */
export function generateSKUPDF({ nomor_surat, warga, desa, kecamatan, data_khusus, tanggal_terbit, keperluan }) {
  // Validasi data penting sebelum generate
  const missing = [];
  if (!desa?.nama_kepala_desa) missing.push('Nama Kepala Desa (profil desa)');
  if (!desa?.jabatan_pejabat) missing.push('Jabatan Pejabat (profil desa)');
  if (!desa?.nama_kabupaten) missing.push('Nama Kabupaten (profil desa)');
  if (!warga?.nama_lengkap) missing.push('Nama Lengkap Warga');
  if (!warga?.nik) missing.push('NIK Warga');

  if (missing.length > 0) {
    return Promise.reject(
      Object.assign(new Error('Data surat tidak lengkap: ' + missing.join(', ')), {
        missingFields: missing,
        statusCode: 422,
      })
    );
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 35, bottom: 35, left: 55, right: 55 },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageW = 595.28;
      const marginL = 55;
      const marginR = 55;
      const contentW = pageW - marginL - marginR;

      // ── 1. KOP SURAT RESMI ────────────────────────────────────────────────
      const kopStartY = 35;
      let textColX = marginL;
      let textColW = contentW;

      if (desa.logo_desa && fs.existsSync(desa.logo_desa)) {
        try {
          doc.image(desa.logo_desa, marginL, kopStartY, { width: 55, height: 55 });
          textColX = marginL + 65;
          textColW = contentW - 65;
        } catch (_) {}
      }

      const kabKop = cleanKabupaten(desa.nama_kabupaten);
      const kecKop = cleanKecamatan(kecamatan?.nama_kecamatan);
      const desaKop = cleanKantorDesa(desa.nama_desa);

      if (kabKop) {
        doc.font('Helvetica-Bold').fontSize(10).text(kabKop, textColX, kopStartY, { width: textColW, align: 'center' });
      }
      if (kecKop) {
        doc.fontSize(10).text(kecKop, { width: textColW, align: 'center' });
      }
      doc.fontSize(13).text(desaKop, { width: textColW, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(8)
        .text(
          `Alamat : ${desa.alamat_kantor || 'Jalan Raya Desa'}${desa.telepon ? ' | Telp: ' + desa.telepon : ''}${desa.email ? ' | Email: ' + desa.email : ''}`,
          textColX,
          doc.y,
          { width: textColW, align: 'center' }
        );

      // Garis ganda pemisah kop surat
      const yLine = Math.max(doc.y + 6, kopStartY + 64);
      doc.lineWidth(1.75).moveTo(marginL, yLine).lineTo(pageW - marginR, yLine).stroke();
      doc.lineWidth(0.5).moveTo(marginL, yLine + 2.5).lineTo(pageW - marginR, yLine + 2.5).stroke();

      doc.y = yLine + 12;

      // ── 2. JUDUL DAN NOMOR SURAT ──────────────────────────────────────────
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('SURAT KETERANGAN USAHA', marginL, doc.y, { width: contentW, align: 'center', underline: true });

      doc.moveDown(0.3);

      const nomorTampil = nomor_surat
        ? `Nomor : ${nomor_surat}`
        : 'Nomor : ......... / SKU / ......... / ' + new Date().getFullYear();

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(nomorTampil, marginL, doc.y, { width: contentW, align: 'center' });

      doc.moveDown(0.9);

      // ── 3. DATA PEJABAT PENANDATANGAN ──────────────────────────────────────
      const namaDesaClean = cleanNamaDesa(desa.nama_desa);
      const namaKecClean = cleanNamaKecamatan(kecamatan?.nama_kecamatan);
      const namaKabClean = cleanNamaKabupaten(desa.nama_kabupaten);
      const jabatanClean = cleanJabatan(desa.jabatan_pejabat);

      const labelX = marginL + 15;
      const colonX = labelX + 130;
      const valueX = colonX + 15;
      const valueW = pageW - marginR - valueX;

      function drawRow(label, value) {
        const y = doc.y;
        doc.font('Helvetica').fontSize(10).text(label, labelX, y);
        doc.text(':', colonX, y);
        doc.text(value || '-', valueX, y, { width: valueW });
        doc.moveDown(0.4);
      }

      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Yang bertanda tangan di bawah ini:', marginL, doc.y);
      doc.moveDown(0.35);

      drawRow('Nama', desa.nama_kepala_desa || '-');
      drawRow('Jabatan', `${jabatanClean} ${namaDesaClean}`);
      drawRow('Alamat', desa.alamat_kantor || `Kantor Desa ${namaDesaClean}`);

      doc.moveDown(0.5);

      // ── 4. DATA IDENTITAS WARGA PEMOHON ────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Menerangkan dengan sebenarnya bahwa berdasarkan permohonan yang bersangkutan serta catatan administrasi di desa kami:', marginL, doc.y, { align: 'justify', width: contentW, lineGap: 1.5 });
      doc.moveDown(0.35);

      const ttl = [warga.tempat_lahir, formatTanggalID(warga.tanggal_lahir)]
        .filter(Boolean)
        .join(', ') || '-';

      let rtRw = '-';
      if (warga.rt || warga.rw) {
        rtRw = `RT ${warga.rt || '-'} / RW ${warga.rw || '-'}`;
      }

      drawRow('Nama Lengkap', warga.nama_lengkap || '-');
      drawRow('NIK', warga.nik || '-');
      drawRow('Tempat, Tanggal Lahir', ttl);
      if (warga.jenis_kelamin) {
        const jkLabel = warga.jenis_kelamin === 'L' ? 'Laki-laki' : warga.jenis_kelamin === 'P' ? 'Perempuan' : warga.jenis_kelamin;
        drawRow('Jenis Kelamin', jkLabel);
      }
      if (warga.pekerjaan) {
        drawRow('Pekerjaan', warga.pekerjaan);
      }
      drawRow('Alamat Domisili', warga.alamat ? `${warga.alamat}${rtRw !== '-' ? ` (${rtRw})` : ''}` : '-');

      doc.moveDown(0.4);

      // ── 5. KETERANGAN USAHA ───────────────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Adalah benar memiliki dan/atau mengelola kegiatan usaha dengan rincian sebagai berikut:', marginL, doc.y, { align: 'justify', width: contentW, lineGap: 1.5 });
      doc.moveDown(0.35);

      drawRow('Nama Usaha', data_khusus?.nama_usaha || '-');
      drawRow('Bidang / Jenis Usaha', data_khusus?.bidang_usaha || '-');
      drawRow('Alamat / Lokasi Usaha', data_khusus?.alamat_usaha || '-');
      if (data_khusus?.tahun_berdiri) {
        drawRow('Mulai Berjalan Sejak', `Tahun ${data_khusus.tahun_berdiri}`);
      }

      doc.moveDown(0.4);

      // ── 6. BADAN SURAT / PERNYATAAN & KEPERLUAN ───────────────────────────
      let redaksiPernyataan =
        `Berdasarkan data permohonan yang telah diverifikasi dan catatan administrasi kependudukan di desa kami, nama tersebut di atas benar memiliki dan menjalankan kegiatan usaha sebagaimana tersebut di atas di wilayah Desa ${namaDesaClean}, Kecamatan ${namaKecClean}, Kabupaten ${namaKabClean}.`;

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(redaksiPernyataan, marginL, doc.y, { align: 'justify', width: contentW, lineGap: 2 });

      doc.moveDown(0.35);

      if (keperluan) {
        doc.text(
          `Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan: ${keperluan}.`,
          marginL,
          doc.y,
          { align: 'justify', width: contentW, lineGap: 2 }
        );
        doc.moveDown(0.35);
      }

      doc.text(
        'Demikian Surat Keterangan Usaha ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.',
        marginL,
        doc.y,
        { align: 'justify', width: contentW, lineGap: 2 }
      );

      doc.moveDown(0.8);

      // ── 7. BLOK TANDA TANGAN PEJABAT ──────────────────────────────────────
      const tglTerbit = tanggal_terbit ? formatTanggalID(tanggal_terbit) : formatTanggalID(new Date());
      const ttdBoxW = 210;
      const ttdX = pageW - marginR - ttdBoxW;

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(`${namaKabClean ? `Kabupaten ${namaKabClean}` : namaDesaClean}, ${tglTerbit}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.moveDown(0.25);
      doc
        .text(`${jabatanClean} ${namaDesaClean}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.moveDown(3.5);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text((desa.nama_kepala_desa || '').toUpperCase(), ttdX, doc.y, { width: ttdBoxW, align: 'center', underline: true });

      doc.moveDown(0.25);
      doc
        .font('Helvetica')
        .fontSize(8)
        .text('(Tanda tangan basah & stempel resmi)', ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── generateSPPDF (Surat Pengantar RT/RW Resmi) ─────────────────────────────

/**
 * Menghasilkan PDF Surat Pengantar RT/RW (SP) resmi.
 * Format rapi, tata letak seimbang 1 halaman A4 portrait, tanpa pengulangan kata.
 *
 * @param {object} opts
 * @param {string}  opts.nomor_surat     - Nomor surat resmi (mis. "001/SP/XI/2026")
 * @param {object}  opts.warga           - Data warga: nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pekerjaan, alamat, rt, rw
 * @param {object}  opts.desa            - Data desa: nama_desa, nama_kabupaten, nama_kepala_desa, jabatan_pejabat, alamat_kantor, telepon, email, logo_desa
 * @param {object}  opts.kecamatan       - Data kecamatan: nama_kecamatan
 * @param {object}  opts.data_khusus     - JSON data_khusus_surat: tujuan_pengantar, no_pengantar_rt, keterangan_tambahan
 * @param {Date}    opts.tanggal_terbit  - Tanggal penerbitan surat
 * @param {string}  opts.keperluan       - Keperluan permohonan
 * @returns {Promise<Buffer>}            - PDF Buffer
 */
export function generateSPPDF({ nomor_surat, warga, desa, kecamatan, data_khusus, tanggal_terbit, keperluan }) {
  // Validasi data penting sebelum generate
  const missing = [];
  if (!desa?.nama_kepala_desa) missing.push('Nama Kepala Desa (profil desa)');
  if (!desa?.jabatan_pejabat) missing.push('Jabatan Pejabat (profil desa)');
  if (!desa?.nama_kabupaten) missing.push('Nama Kabupaten (profil desa)');
  if (!warga?.nama_lengkap) missing.push('Nama Lengkap Warga');
  if (!warga?.nik) missing.push('NIK Warga');

  if (missing.length > 0) {
    return Promise.reject(
      Object.assign(new Error('Data surat tidak lengkap: ' + missing.join(', ')), {
        missingFields: missing,
        statusCode: 422,
      })
    );
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 35, bottom: 35, left: 55, right: 55 },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageW = 595.28;
      const marginL = 55;
      const marginR = 55;
      const contentW = pageW - marginL - marginR;

      // ── 1. KOP SURAT RESMI ────────────────────────────────────────────────
      const kopStartY = 35;
      let textColX = marginL;
      let textColW = contentW;

      if (desa.logo_desa && fs.existsSync(desa.logo_desa)) {
        try {
          doc.image(desa.logo_desa, marginL, kopStartY, { width: 55, height: 55 });
          textColX = marginL + 65;
          textColW = contentW - 65;
        } catch (_) {}
      }

      const kabKop = cleanKabupaten(desa.nama_kabupaten);
      const kecKop = cleanKecamatan(kecamatan?.nama_kecamatan);
      const desaKop = cleanKantorDesa(desa.nama_desa);

      if (kabKop) {
        doc.font('Helvetica-Bold').fontSize(10).text(kabKop, textColX, kopStartY, { width: textColW, align: 'center' });
      }
      if (kecKop) {
        doc.fontSize(10).text(kecKop, { width: textColW, align: 'center' });
      }
      doc.fontSize(13).text(desaKop, { width: textColW, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(8)
        .text(
          `Alamat : ${desa.alamat_kantor || 'Jalan Raya Desa'}${desa.telepon ? ' | Telp: ' + desa.telepon : ''}${desa.email ? ' | Email: ' + desa.email : ''}`,
          textColX,
          doc.y,
          { width: textColW, align: 'center' }
        );

      // Garis ganda pemisah kop surat
      const yLine = Math.max(doc.y + 6, kopStartY + 64);
      doc.lineWidth(1.75).moveTo(marginL, yLine).lineTo(pageW - marginR, yLine).stroke();
      doc.lineWidth(0.5).moveTo(marginL, yLine + 2.5).lineTo(pageW - marginR, yLine + 2.5).stroke();

      doc.y = yLine + 12;

      // ── 2. JUDUL DAN NOMOR SURAT ──────────────────────────────────────────
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('SURAT PENGANTAR', marginL, doc.y, { width: contentW, align: 'center', underline: true });

      doc.moveDown(0.3);

      const nomorTampil = nomor_surat
        ? `Nomor : ${nomor_surat}`
        : 'Nomor : ......... / SP / ......... / ' + new Date().getFullYear();

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(nomorTampil, marginL, doc.y, { width: contentW, align: 'center' });

      doc.moveDown(0.9);

      // ── 3. DATA PEJABAT PENANDATANGAN ──────────────────────────────────────
      const namaDesaClean = cleanNamaDesa(desa.nama_desa);
      const namaKecClean = cleanNamaKecamatan(kecamatan?.nama_kecamatan);
      const namaKabClean = cleanNamaKabupaten(desa.nama_kabupaten);
      const jabatanClean = cleanJabatan(desa.jabatan_pejabat);

      const labelX = marginL + 15;
      const colonX = labelX + 130;
      const valueX = colonX + 15;
      const valueW = pageW - marginR - valueX;

      function drawRow(label, value) {
        const y = doc.y;
        doc.font('Helvetica').fontSize(10).text(label, labelX, y);
        doc.text(':', colonX, y);
        doc.text(value || '-', valueX, y, { width: valueW });
        doc.moveDown(0.4);
      }

      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Yang bertanda tangan di bawah ini:', marginL, doc.y);
      doc.moveDown(0.35);

      drawRow('Nama', desa.nama_kepala_desa || '-');
      drawRow('Jabatan', `${jabatanClean} ${namaDesaClean}`);
      drawRow('Alamat', desa.alamat_kantor || `Kantor Desa ${namaDesaClean}`);

      doc.moveDown(0.5);

      // ── 4. DATA IDENTITAS WARGA PEMOHON ────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Menerangkan dengan sebenarnya bahwa warga yang bersangkutan di bawah ini:', marginL, doc.y, { align: 'justify', width: contentW, lineGap: 1.5 });
      doc.moveDown(0.35);

      const ttl = [warga.tempat_lahir, formatTanggalID(warga.tanggal_lahir)]
        .filter(Boolean)
        .join(', ') || '-';

      let rtRw = '-';
      if (warga.rt || warga.rw) {
        rtRw = `RT ${warga.rt || '-'} / RW ${warga.rw || '-'}`;
      }

      drawRow('Nama Lengkap', warga.nama_lengkap || '-');
      drawRow('NIK', warga.nik || '-');
      drawRow('Tempat, Tanggal Lahir', ttl);
      if (warga.jenis_kelamin) {
        const jkLabel = warga.jenis_kelamin === 'L' ? 'Laki-laki' : warga.jenis_kelamin === 'P' ? 'Perempuan' : warga.jenis_kelamin;
        drawRow('Jenis Kelamin', jkLabel);
      }
      if (warga.pekerjaan) {
        drawRow('Pekerjaan', warga.pekerjaan);
      }
      drawRow('Alamat Domisili', warga.alamat ? `${warga.alamat}${rtRw !== '-' ? ` (${rtRw})` : ''}` : '-');
      drawRow('Desa / Kelurahan', `Desa ${namaDesaClean}`);
      drawRow('Kecamatan', `Kecamatan ${namaKecClean}`);
      if (namaKabClean) {
        drawRow('Kabupaten', `Kabupaten ${namaKabClean}`);
      }

      doc.moveDown(0.4);

      // ── 5. KETERANGAN PENGANTAR ───────────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(10)
        .text(
          `Adalah benar warga penduduk Desa ${namaDesaClean}, Kecamatan ${namaKecClean}, Kabupaten ${namaKabClean}. Surat pengantar ini diberikan untuk keperluan / tujuan sebagai berikut:`,
          marginL,
          doc.y,
          { align: 'justify', width: contentW, lineGap: 1.5 }
        );
      doc.moveDown(0.35);

      if (data_khusus?.tujuan_pengantar) {
        drawRow('Instansi / Tujuan', data_khusus.tujuan_pengantar);
      }
      if (keperluan) {
        drawRow('Maksud / Keperluan', keperluan);
      }
      if (data_khusus?.no_pengantar_rt) {
        drawRow('No. Pengantar RT/RW', data_khusus.no_pengantar_rt);
      }
      if (data_khusus?.keterangan_tambahan) {
        drawRow('Keterangan Tambahan', data_khusus.keterangan_tambahan);
      }

      doc.moveDown(0.4);

      // ── 6. PENUTUP ────────────────────────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(10)
        .text(
          'Demikian Surat Pengantar ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.',
          marginL,
          doc.y,
          { align: 'justify', width: contentW, lineGap: 2 }
        );

      doc.moveDown(0.8);

      // ── 7. BLOK TANDA TANGAN PEJABAT ──────────────────────────────────────
      const tglTerbit = tanggal_terbit ? formatTanggalID(tanggal_terbit) : formatTanggalID(new Date());
      const ttdBoxW = 210;
      const ttdX = pageW - marginR - ttdBoxW;

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(`${namaKabClean ? `Kabupaten ${namaKabClean}` : namaDesaClean}, ${tglTerbit}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.moveDown(0.25);
      doc
        .text(`${jabatanClean} ${namaDesaClean}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.moveDown(3.5);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text((desa.nama_kepala_desa || '').toUpperCase(), ttdX, doc.y, { width: ttdBoxW, align: 'center', underline: true });

      doc.moveDown(0.25);
      doc
        .font('Helvetica')
        .fontSize(8)
        .text('(Tanda tangan basah & stempel resmi)', ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── generateSKTMPDF (Surat Keterangan Tidak Mampu Resmi) ────────────────────

/**
 * Menghasilkan PDF Surat Keterangan Tidak Mampu (SKTM) resmi.
 * Format rapi, tata letak seimbang 1 halaman A4 portrait, tanpa pengulangan kata.
 *
 * @param {object} opts
 * @param {string}  opts.nomor_surat     - Nomor surat resmi (mis. "001/SKTM/XI/2026")
 * @param {object}  opts.warga           - Data warga: nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pekerjaan, alamat, rt, rw
 * @param {object}  opts.desa            - Data desa: nama_desa, nama_kabupaten, nama_kepala_desa, jabatan_pejabat, alamat_kantor, telepon, email, logo_desa
 * @param {object}  opts.kecamatan       - Data kecamatan: nama_kecamatan
 * @param {object}  opts.data_khusus     - JSON data_khusus_surat: penghasilan_bulanan, jumlah_tanggungan, keterangan_tambahan
 * @param {Date}    opts.tanggal_terbit  - Tanggal penerbitan surat
 * @param {string}  opts.keperluan       - Keperluan permohonan
 * @returns {Promise<Buffer>}            - PDF Buffer
 */
export function generateSKTMPDF({ nomor_surat, warga, desa, kecamatan, data_khusus, tanggal_terbit, keperluan }) {
  // Validasi data penting sebelum generate
  const missing = [];
  if (!desa?.nama_kepala_desa) missing.push('Nama Kepala Desa (profil desa)');
  if (!desa?.jabatan_pejabat) missing.push('Jabatan Pejabat (profil desa)');
  if (!desa?.nama_kabupaten) missing.push('Nama Kabupaten (profil desa)');
  if (!warga?.nama_lengkap) missing.push('Nama Lengkap Warga');
  if (!warga?.nik) missing.push('NIK Warga');

  if (missing.length > 0) {
    return Promise.reject(
      Object.assign(new Error('Data surat tidak lengkap: ' + missing.join(', ')), {
        missingFields: missing,
        statusCode: 422,
      })
    );
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 35, bottom: 35, left: 55, right: 55 },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageW = 595.28;
      const marginL = 55;
      const marginR = 55;
      const contentW = pageW - marginL - marginR;

      // ── 1. KOP SURAT RESMI ────────────────────────────────────────────────
      const kopStartY = 35;
      let textColX = marginL;
      let textColW = contentW;

      if (desa.logo_desa && fs.existsSync(desa.logo_desa)) {
        try {
          doc.image(desa.logo_desa, marginL, kopStartY, { width: 55, height: 55 });
          textColX = marginL + 65;
          textColW = contentW - 65;
        } catch (_) {}
      }

      const kabKop = cleanKabupaten(desa.nama_kabupaten);
      const kecKop = cleanKecamatan(kecamatan?.nama_kecamatan);
      const desaKop = cleanKantorDesa(desa.nama_desa);

      if (kabKop) {
        doc.font('Helvetica-Bold').fontSize(10).text(kabKop, textColX, kopStartY, { width: textColW, align: 'center' });
      }
      if (kecKop) {
        doc.fontSize(10).text(kecKop, { width: textColW, align: 'center' });
      }
      doc.fontSize(13).text(desaKop, { width: textColW, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(8)
        .text(
          `Alamat : ${desa.alamat_kantor || 'Jalan Raya Desa'}${desa.telepon ? ' | Telp: ' + desa.telepon : ''}${desa.email ? ' | Email: ' + desa.email : ''}`,
          textColX,
          doc.y,
          { width: textColW, align: 'center' }
        );

      // Garis ganda pemisah kop surat
      const yLine = Math.max(doc.y + 6, kopStartY + 64);
      doc.lineWidth(1.75).moveTo(marginL, yLine).lineTo(pageW - marginR, yLine).stroke();
      doc.lineWidth(0.5).moveTo(marginL, yLine + 2.5).lineTo(pageW - marginR, yLine + 2.5).stroke();

      doc.y = yLine + 12;

      // ── 2. JUDUL DAN NOMOR SURAT ──────────────────────────────────────────
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('SURAT KETERANGAN TIDAK MAMPU', marginL, doc.y, { width: contentW, align: 'center', underline: true });

      doc.moveDown(0.3);

      const nomorTampil = nomor_surat
        ? `Nomor : ${nomor_surat}`
        : 'Nomor : ......... / SKTM / ......... / ' + new Date().getFullYear();

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(nomorTampil, marginL, doc.y, { width: contentW, align: 'center' });

      doc.moveDown(0.9);

      // ── 3. DATA PEJABAT PENANDATANGAN ──────────────────────────────────────
      const namaDesaClean = cleanNamaDesa(desa.nama_desa);
      const namaKecClean = cleanNamaKecamatan(kecamatan?.nama_kecamatan);
      const namaKabClean = cleanNamaKabupaten(desa.nama_kabupaten);
      const jabatanClean = cleanJabatan(desa.jabatan_pejabat);

      const labelX = marginL + 15;
      const colonX = labelX + 130;
      const valueX = colonX + 15;
      const valueW = pageW - marginR - valueX;

      function drawRow(label, value) {
        const y = doc.y;
        doc.font('Helvetica').fontSize(10).text(label, labelX, y);
        doc.text(':', colonX, y);
        doc.text(value || '-', valueX, y, { width: valueW });
        doc.moveDown(0.4);
      }

      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Yang bertanda tangan di bawah ini:', marginL, doc.y);
      doc.moveDown(0.35);

      drawRow('Nama', desa.nama_kepala_desa || '-');
      drawRow('Jabatan', `${jabatanClean} ${namaDesaClean}`);
      drawRow('Alamat', desa.alamat_kantor || `Kantor Desa ${namaDesaClean}`);

      doc.moveDown(0.5);

      // ── 4. DATA IDENTITAS WARGA PEMOHON ────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Menerangkan dengan sebenarnya bahwa warga yang bersangkutan di bawah ini:', marginL, doc.y, { align: 'justify', width: contentW, lineGap: 1.5 });
      doc.moveDown(0.35);

      const ttl = [warga.tempat_lahir, formatTanggalID(warga.tanggal_lahir)]
        .filter(Boolean)
        .join(', ') || '-';

      let rtRw = '-';
      if (warga.rt || warga.rw) {
        rtRw = `RT ${warga.rt || '-'} / RW ${warga.rw || '-'}`;
      }

      drawRow('Nama Lengkap', warga.nama_lengkap || '-');
      drawRow('NIK', warga.nik || '-');
      drawRow('Tempat, Tanggal Lahir', ttl);
      if (warga.jenis_kelamin) {
        const jkLabel = warga.jenis_kelamin === 'L' ? 'Laki-laki' : warga.jenis_kelamin === 'P' ? 'Perempuan' : warga.jenis_kelamin;
        drawRow('Jenis Kelamin', jkLabel);
      }
      if (warga.pekerjaan) {
        drawRow('Pekerjaan', warga.pekerjaan);
      }
      drawRow('Alamat Domisili', warga.alamat ? `${warga.alamat}${rtRw !== '-' ? ` (${rtRw})` : ''}` : '-');
      drawRow('Desa / Kelurahan', `Desa ${namaDesaClean}`);
      drawRow('Kecamatan', `Kecamatan ${namaKecClean}`);
      if (namaKabClean) {
        drawRow('Kabupaten', `Kabupaten ${namaKabClean}`);
      }

      doc.moveDown(0.4);

      // ── 5. KETERANGAN KONDISI EKONOMI & PERNYATAAN RESMI ──────────────────
      let redaksiPernyataan =
        `Berdasarkan data permohonan yang diajukan oleh yang bersangkutan serta data administrasi yang tercatat dan telah diverifikasi di desa kami, nama tersebut di atas adalah benar warga penduduk Desa ${namaDesaClean}, Kecamatan ${namaKecClean}, Kabupaten ${namaKabClean}, yang saat ini tergolong dalam keluarga dengan keadaan ekonomi kurang mampu.`;

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(redaksiPernyataan, marginL, doc.y, { align: 'justify', width: contentW, lineGap: 2 });

      doc.moveDown(0.35);

      // Data tambahan ekonomi jika pemohon mengisi
      if (data_khusus?.penghasilan_bulanan || data_khusus?.jumlah_tanggungan) {
        if (data_khusus?.penghasilan_bulanan) {
          drawRow('Penghasilan Rata-rata', data_khusus.penghasilan_bulanan);
        }
        if (data_khusus?.jumlah_tanggungan) {
          drawRow('Tanggungan Keluarga', data_khusus.jumlah_tanggungan);
        }
        doc.moveDown(0.3);
      }

      // ── 6. KEPERLUAN & KETERANGAN TAMBAHAN ─────────────────────────────────
      if (keperluan) {
        doc.text(
          `Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan: ${keperluan}.`,
          marginL,
          doc.y,
          { align: 'justify', width: contentW, lineGap: 2 }
        );
        doc.moveDown(0.35);
      }

      if (data_khusus?.keterangan_tambahan) {
        doc.text(
          `Keterangan tambahan: ${data_khusus.keterangan_tambahan}.`,
          marginL,
          doc.y,
          { align: 'justify', width: contentW, lineGap: 2 }
        );
        doc.moveDown(0.35);
      }

      // ── 7. PENUTUP ────────────────────────────────────────────────────────
      doc.text(
        'Demikian Surat Keterangan Tidak Mampu ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.',
        marginL,
        doc.y,
        { align: 'justify', width: contentW, lineGap: 2 }
      );

      doc.moveDown(0.8);

      // ── 8. BLOK TANDA TANGAN PEJABAT ──────────────────────────────────────
      const tglTerbit = tanggal_terbit ? formatTanggalID(tanggal_terbit) : formatTanggalID(new Date());
      const ttdBoxW = 210;
      const ttdX = pageW - marginR - ttdBoxW;

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(`${namaKabClean ? `Kabupaten ${namaKabClean}` : namaDesaClean}, ${tglTerbit}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.moveDown(0.25);
      doc
        .text(`${jabatanClean} ${namaDesaClean}`, ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.moveDown(3.5);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text((desa.nama_kepala_desa || '').toUpperCase(), ttdX, doc.y, { width: ttdBoxW, align: 'center', underline: true });

      doc.moveDown(0.25);
      doc
        .font('Helvetica')
        .fontSize(8)
        .text('(Tanda tangan basah & stempel resmi)', ttdX, doc.y, { width: ttdBoxW, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
