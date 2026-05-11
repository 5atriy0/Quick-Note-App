# QuickNote 📝

QuickNote adalah aplikasi pencatatan modern yang mengutamakan kecepatan, desain minimalis, dan arsitektur **Offline-First**. Dirancang untuk menangkap ide dengan secepat kilat, Anda dapat membuat, mengedit, dan menghapus catatan kapan pun—termasuk saat Anda sama sekali tidak memiliki koneksi internet.

## 🚀 Fitur Utama

- **Offline-First & PWA**: Aplikasi ini adalah Progressive Web App (PWA). Berkat integrasi IndexedDB (Dexie), seluruh catatan disimpan secara lokal di perangkat Anda terlebih dahulu. Aplikasi akan tetap memuat dan berfungsi normal meskipun internet mati (Offline Mode).
- **Background Auto-Sync**: Sinkronisasi cerdas. Perubahan apa pun yang Anda lakukan saat offline akan secara otomatis dikirim dan disinkronkan ke cloud (Supabase) tepat setelah koneksi internet kembali pulih.
- **Markdown Editor**: Editor catatan mendukung format Markdown dengan mode *Full Screen* dan tombol *Preview* real-time.
- **Sematkan & Label**: Anda dapat melakukan *Pin* pada catatan penting agar selalu berada di paling atas, serta menambahkan *Tags* (label) pada masing-masing catatan.
- **Sistem Arsip & Tempat Sampah**: Susun ruang kerja Anda dengan memindahkan catatan lama ke *Archive* (Arsip) atau buang ke *Trash* (bisa di-*restore* kembali).
- **UI/UX Modern**: Desain antarmuka responsif yang bersih, mendukung *Dark Mode* otomatis, dan dilengkapi animasi transisi yang mulus.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Database (Cloud) & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Database (Lokal)**: [Dexie.js](https://dexie.org/) & `dexie-react-hooks` (Reaktivitas UI secara langsung dari IndexedDB)
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **PWA Engine**: `@ducanh2912/next-pwa` (Workbox)

## 💻 Cara Menjalankan Project (Getting Started)

### Prasyarat
Pastikan Anda sudah menginstal Node.js dan memiliki proyek Supabase yang aktif.

### Instalasi & Setup

1. *Clone* atau unduh *repository* ini, lalu instal dependensinya:
```bash
npm install
```

2. Siapkan *Environment Variables*. Buat file bernama `.env.local` di root folder proyek Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=url_project_supabase_anda
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_supabase_anda
```

3. **Setup Database Supabase**:
Buka halaman **SQL Editor** di *dashboard* Supabase Anda, dan jalankan perintah berikut untuk membuat tabel catatan:
```sql
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT ''::text,
  content text NOT NULL DEFAULT ''::text,
  tags ARRAY DEFAULT ARRAY[]::text[],
  is_archived boolean DEFAULT false,
  is_trashed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_pinned boolean DEFAULT false,
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

4. Jalankan *development server*:
```bash
npm run dev
```
Aplikasi kini dapat diakses melalui `http://localhost:3000`.

---

### 🌐 Cara Menguji Mode Offline (PWA)

Secara bawaan, fitur *Service Worker* (yang mengatur *cache* mode offline) **tidak berjalan di mode development** (`npm run dev`). Untuk menguji kemampuan offline aplikasi ini secara penuh, Anda harus menjalankannya di mode production:

1. Matikan server *dev*, lalu jalankan proses *build* (ini akan memicu pembuatan file `sw.js` via Webpack):
```bash
npm run build
```

2. Setelah *build* sukses, jalankan server *production*:
```bash
npm run start
```

3. Buka browser, tekan `F12` (DevTools), pilih tab **Network**, lalu ubah pengaturan kecepatan internet dari *No throttling* menjadi **Offline**. Cobalah me-refresh halaman atau menulis catatan baru!
