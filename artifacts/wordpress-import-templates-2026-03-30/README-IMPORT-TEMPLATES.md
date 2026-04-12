# WordPress Import Templates

Folder ini berisi template CSV untuk migrasi konten lama MikroLiving ke WordPress theme `mikroliving-theme`.

## File yang tersedia

- `projects-import-template.csv`
- `services-import-template.csv`
- `testimonials-import-template.csv`
- `posts-import-template.csv`

## Rekomendasi plugin import

Template ini paling mudah dipakai dengan plugin seperti:

- WP All Import
- WP Ultimate CSV Importer
- Really Simple CSV Importer untuk post biasa

## Cara pakai umum

1. Duplicate file template yang sesuai.
2. Ganti baris contoh dengan data asli Anda.
3. Upload media gambar ke WordPress atau pastikan URL gambar publik masih valid.
4. Jalankan import ke post type yang sesuai.
5. Map kolom custom field sesuai daftar di bawah.

## Mapping penting per file

### Projects

- Import ke custom post type `ml_project`
- Featured image: `featured_image_url`
- Taxonomy project type: `taxonomy_ml_project_type`
- Custom fields:
  - `meta_location` -> `location`
  - `meta_area` -> `area`
  - `meta_project_label` -> `project_label`
  - `meta_client_name` -> `client_name`
  - `meta_year_completed` -> `year_completed`

### Services

- Import ke custom post type `ml_service`
- Featured image: `featured_image_url`
- Custom fields:
  - `meta_short_label` -> `short_label`
  - `meta_price_from` -> `price_from`
- `legacy_features_json` hanya referensi; isi utama service sebaiknya ditempatkan di `post_content`

### Testimonials

- Import ke custom post type `ml_testimonial`
- Featured image: `featured_image_url`
- Custom fields:
  - `meta_client_role` -> `client_role`
  - `meta_rating` -> `rating`
- `related_project_slug` hanya kolom referensi manual, karena theme publik saat ini belum menarik relasi project secara otomatis

### Posts

- Import ke `Posts` bawaan WordPress
- Featured image: `featured_image_url`
- Category: `categories`
- Tags: `tags`
- Author: `author_email`
- Optional custom field:
  - `meta_read_time` -> `read_time`

## Format praktis

- Gunakan `publish` atau `draft` pada `post_status`
- Gunakan slug kecil-kecil pada `post_name`
- Untuk `tags`, gunakan pemisah `|`
- Untuk `categories`, satu atau beberapa nama kategori dipisah `|` bila plugin import mendukung

## Catatan penting

- Theme WordPress sudah menyediakan CPT `ml_project`, `ml_service`, dan `ml_testimonial`
- Setelah theme aktif, buka `Settings > Permalinks` lalu klik `Save Changes` sekali
- Untuk Hostinger, paling aman upload theme dulu, aktifkan, baru lakukan import konten
