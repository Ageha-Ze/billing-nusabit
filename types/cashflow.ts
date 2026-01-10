export type CashFlow = {
  id: number; // serial primary key
  kas_id: string | null; // UUID reference to bank_accounts
  cabang_id: number | null;
  tanggal: string; // date
  jenis: 'masuk' | 'keluar'; // type
  kategori: string; // category
  keterangan: string | null; // description
  jumlah: number; // amount
  saldo_setelah: number; // balance after transaction
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
