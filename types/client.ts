export type Client = {
  id: string;
  name: string;
  email: string;
  phone_wa: string | null;
  address: string | null;
  identity_no: string | null; // KTP number
  ktp_file_url: string | null; // Added for KTP file upload
  created_at: string;
};
