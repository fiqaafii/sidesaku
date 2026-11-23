/**
 * Validator input untuk alur autentikasi
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9._]{3,50}$/;
const nikRegex = /^\d{16}$/;

export function validateRegisterWarga(body) {
  const errors = [];
  const {
    username, email, password,
    nama_lengkap, nik, no_telepon, alamat, id_desa
  } = body || {};

  // Validasi akun
  if (!username || typeof username !== 'string' || !usernameRegex.test(username.trim())) {
    errors.push('Username wajib diisi 3-50 karakter (hanya huruf, angka, titik, dan garis bawah tanpa spasi).');
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 100) {
    errors.push('Format email tidak valid atau melebihi batas 100 karakter.');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password wajib diisi minimal 8 karakter.');
  }

  // Validasi biodata warga
  if (!nama_lengkap || typeof nama_lengkap !== 'string' || !nama_lengkap.trim() || nama_lengkap.length > 150) {
    errors.push('Nama lengkap wajib diisi maksimal 150 karakter.');
  }

  if (!nik || typeof nik !== 'string' || !nikRegex.test(nik.trim())) {
    errors.push('NIK wajib terdiri dari tepat 16 digit angka kependudukan.');
  }

  if (!no_telepon || typeof no_telepon !== 'string' || !no_telepon.trim() || no_telepon.length > 20) {
    errors.push('Nomor telepon wajib diisi maksimal 20 karakter.');
  }

  if (!alamat || typeof alamat !== 'string' || !alamat.trim()) {
    errors.push('Alamat lengkap domisili wajib diisi.');
  }

  const parsedIdDesa = parseInt(id_desa, 10);
  if (!id_desa || isNaN(parsedIdDesa) || parsedIdDesa <= 0) {
    errors.push('Pilihan desa wajib ditentukan dan bernilai valid.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      username: username ? username.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      password: password || '',
      nama_lengkap: nama_lengkap ? nama_lengkap.trim() : '',
      nik: nik ? nik.trim() : '',
      no_telepon: no_telepon ? no_telepon.trim() : '',
      alamat: alamat ? alamat.trim() : '',
      id_desa: parsedIdDesa,
    },
  };
}

export function validateRegisterAdmin(body) {
  const errors = [];
  const { nama_lengkap, username, email, password, id_desa } = body || {};

  if (!nama_lengkap || typeof nama_lengkap !== 'string' || !nama_lengkap.trim() || nama_lengkap.length > 150) {
    errors.push('Nama lengkap petugas wajib diisi maksimal 150 karakter.');
  }

  if (!username || typeof username !== 'string' || !usernameRegex.test(username.trim())) {
    errors.push('Username wajib diisi 3-50 karakter (hanya huruf, angka, titik, dan garis bawah tanpa spasi).');
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 100) {
    errors.push('Format email resmi tidak valid.');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password wajib diisi minimal 8 karakter.');
  }

  const parsedIdDesa = parseInt(id_desa, 10);
  if (!id_desa || isNaN(parsedIdDesa) || parsedIdDesa <= 0) {
    errors.push('Pilihan desa kewenangan wajib ditentukan dan bernilai valid.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      nama_lengkap: nama_lengkap ? nama_lengkap.trim() : '',
      username: username ? username.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      password: password || '',
      id_desa: parsedIdDesa,
    },
  };
}

export function validateLogin(body) {
  const errors = [];
  const { username, password } = body || {};

  if (!username || typeof username !== 'string' || !username.trim()) {
    errors.push('Username wajib diisi.');
  }

  if (!password || typeof password !== 'string' || !password) {
    errors.push('Password wajib diisi.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      username: username ? username.trim() : '',
      password: password || '',
    },
  };
}
