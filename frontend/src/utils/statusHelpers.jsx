// ── Utilitas label dan warna status ──────────────────────
export const statusConfig = {
  diajukan: {
    label: 'Diajukan',
    badgeClass: 'badge badge-blue',
    dot: 'bg-blue-500',
  },
  diproses: {
    label: 'Sedang Diproses',
    badgeClass: 'badge badge-yellow',
    dot: 'bg-yellow-500',
  },
  perlu_perbaikan: {
    label: 'Perlu Perbaikan',
    badgeClass: 'badge badge-orange',
    dot: 'bg-orange-500',
  },
  disetujui: {
    label: 'Disetujui',
    badgeClass: 'badge badge-green',
    dot: 'bg-green-500',
  },
  ditolak: {
    label: 'Ditolak',
    badgeClass: 'badge badge-red',
    dot: 'bg-red-500',
  },
  selesai: {
    label: 'Selesai',
    badgeClass: 'badge badge-gray',
    dot: 'bg-gray-400',
  },
};

export const statusAkunConfig = {
  menunggu: { label: 'Menunggu Persetujuan', badgeClass: 'badge badge-yellow' },
  aktif:    { label: 'Aktif',                badgeClass: 'badge badge-green' },
  ditolak:  { label: 'Ditolak',              badgeClass: 'badge badge-red' },
  nonaktif: { label: 'Nonaktif',             badgeClass: 'badge badge-gray' },
};

export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, badgeClass: 'badge badge-gray' };
  return (
    <span className={cfg.badgeClass}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export const StatusAkunBadge = ({ status }) => {
  const cfg = statusAkunConfig[status] || { label: status, badgeClass: 'badge badge-gray' };
  return <span className={cfg.badgeClass}>{cfg.label}</span>;
};

// ── Format tanggal ───────────────────────────────────────
export const formatTanggal = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

export const formatTanggalWaktu = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Role display ─────────────────────────────────────────
export const roleLabel = {
  super_admin: 'Super Admin Kecamatan',
  admin_desa: 'Admin Desa',
  warga: 'Warga',
};
