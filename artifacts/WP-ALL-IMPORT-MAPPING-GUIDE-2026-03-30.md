# WP All Import Mapping Guide for MikroLiving

Panduan ini dibuat untuk import file CSV nyata berikut ke WordPress/Hostinger menggunakan WP All Import:

- `projects-import-real.csv`
- `services-import-real.csv`
- `testimonials-import-real.csv`
- `posts-import-real.csv`

Folder file sumber:

- `artifacts/wordpress-import-data-2026-03-30/`

## Persiapan sebelum import

1. Upload dan aktifkan theme `mikroliving-theme` dulu.
2. Buka `Settings > Permalinks` lalu klik `Save Changes` sekali.
3. Pastikan custom post type sudah muncul di admin:
   - `Projects`
   - `Services`
   - `Testimonials`
4. Install dan aktifkan WP All Import.
5. Jika Anda akan import gambar dari URL, pastikan URL gambar benar-benar bisa diakses publik.
6. Jika Anda akan import gambar dari file lokal server, upload dulu ke `/wp-content/uploads/wpallimport/files/`.

## Rekomendasi urutan import

1. `projects-import-real.csv`
2. `services-import-real.csv`
3. `testimonials-import-real.csv`
4. `posts-import-real.csv`

Urutan ini saya pilih supaya testimonial yang mereferensi project slug sudah punya data proyek lebih dulu.

## Aturan umum yang dipakai di semua import

### Import Type

- Gunakan `New Items` untuk import pertama.
- Jika nanti mau update data dari file CSV yang sama, jalankan ulang import yang sama dengan `Unique Identifier` yang sama.

### Unique Identifier

- Gunakan kolom `legacy_id` sebagai identifier utama.
- Di Step 4, drag kolom `legacy_id` ke kotak `Unique Identifier`.
- Jangan pakai deskripsi atau excerpt sebagai identifier.

### Images

Jika kolom `featured_image_url` berisi URL penuh:
- Di bagian `Images`, pilih `Download images hosted elsewhere`.
- Drag kolom `featured_image_url` ke box URL gambar.
- Aktifkan `Set the first image to the Featured Image`.
- Gunakan `Preview & Test` untuk memastikan URL gambarnya valid.

Jika Anda sudah upload gambar ke server:
- Pilih `Use images currently uploaded in wp-content/uploads/wpallimport/files/`.
- Gunakan nama file atau path yang cocok dengan file yang Anda upload.

Rekomendasi aman:
- Jangan centang opsi membuat post jadi draft kalau gambar gagal, kecuali Anda memang ingin semua record tanpa gambar ditahan dulu.

### Custom Fields auto-detect

WP All Import bisa auto-detect custom field theme hanya jika field itu sudah pernah ada pada post `published` di database WordPress.

Kalau field belum muncul otomatis, tambahkan manual dengan nama field persis seperti ini:
- `location`
- `area`
- `project_label`
- `client_name`
- `year_completed`
- `short_label`
- `price_from`
- `client_role`
- `rating`
- `is_featured`
- `sort_order`

## 1. Import Projects

File:
- `projects-import-real.csv`

Target post type:
- `Projects` atau `ml_project`

### Step 1

- `All Import > New Import`
- Upload `projects-import-real.csv`
- Pilih `New Items`
- Pilih import ke `Projects`

### Step 2

- Review record sample.
- Pastikan setiap row mewakili satu project.

### Step 3: Drag & Drop Mapping

#### Main Content

- Title <- `post_title`
- Content <- `post_content`
- Excerpt <- `post_excerpt`
- Slug <- `post_name`
- Status <- `post_status`

#### Taxonomy

Di section Taxonomies:
- `ml_project_type` <- `taxonomy_ml_project_type`

Gunakan slug taxonomy apa adanya seperti `apartment`, `residential`, `office`, `commercial` untuk menghindari duplikasi term.

#### Images

Di section Images:
- Image source <- `featured_image_url`
- Aktifkan `Set the first image to the Featured Image`

#### Custom Fields

Tambahkan custom fields berikut:
- `location` <- `meta_location`
- `area` <- `meta_area`
- `project_label` <- `meta_project_label`
- `client_name` <- `meta_client_name`
- `year_completed` <- `meta_year_completed`
- `is_featured` <- `meta_is_featured`
- `sort_order` <- `meta_sort_order`

Optional reference fields:
- `legacy_status` <- `legacy_status`
- `legacy_id` <- `legacy_id`
- `seo_title` <- `seo_title`
- `seo_description` <- `seo_description`

### Step 4

- Unique Identifier <- `legacy_id`
- Untuk rerun import, tetap gunakan identifier yang sama.

### Step 5

- Run import.
- Setelah selesai, cek beberapa project di admin dan frontend archive `Projects`.

## 2. Import Services

File:
- `services-import-real.csv`

Target post type:
- `Services` atau `ml_service`

### Step 1

- `All Import > New Import`
- Upload `services-import-real.csv`
- Pilih `New Items`
- Pilih import ke `Services`

### Step 2

- Review sample record.
- Pastikan content service berisi paragraf + bullet HTML jika tersedia.

### Step 3: Drag & Drop Mapping

#### Main Content

- Title <- `post_title`
- Content <- `post_content`
- Excerpt <- `post_excerpt`
- Slug <- `post_name`
- Status <- `post_status`

#### Images

- Image source <- `featured_image_url`
- Aktifkan `Set the first image to the Featured Image`

#### Custom Fields

Tambahkan custom fields berikut:
- `short_label` <- `meta_short_label`
- `price_from` <- `meta_price_from`
- `sort_order` <- `meta_sort_order`

Optional reference fields:
- `legacy_features_json` <- `legacy_features_json`
- `legacy_is_active` <- `legacy_is_active`
- `legacy_id` <- `legacy_id`

### Step 4

- Unique Identifier <- `legacy_id`

### Step 5

- Run import.
- Cek apakah service cards tampil di homepage dan archive service.

## 3. Import Testimonials

File:
- `testimonials-import-real.csv`

Target post type:
- `Testimonials` atau `ml_testimonial`

### Step 1

- `All Import > New Import`
- Upload `testimonials-import-real.csv`
- Pilih `New Items`
- Pilih import ke `Testimonials`

### Step 2

- Review record.
- Pastikan nama klien dan isi testimonial sudah benar.

### Step 3: Drag & Drop Mapping

#### Main Content

- Title <- `post_title`
- Content <- `post_content`
- Excerpt <- `post_excerpt`
- Slug <- `post_name`
- Status <- `post_status`

#### Images

- Image source <- `featured_image_url`
- Aktifkan `Set the first image to the Featured Image`

#### Custom Fields

Tambahkan custom fields berikut:
- `client_role` <- `meta_client_role`
- `rating` <- `meta_rating`
- `is_featured` <- `meta_is_featured`
- `sort_order` <- `meta_sort_order`

Optional reference fields:
- `related_project_slug` <- `related_project_slug`
- `related_project_title` <- `related_project_title`
- `legacy_is_active` <- `legacy_is_active`
- `legacy_id` <- `legacy_id`

Catatan:
- Theme publik saat ini tidak memakai relasi testimonial -> project secara otomatis.
- Kolom `related_project_slug` lebih aman disimpan sebagai referensi dulu.

### Step 4

- Unique Identifier <- `legacy_id`

### Step 5

- Run import.
- Cek section testimonial di homepage.

## 4. Import Posts

File:
- `posts-import-real.csv`

Target post type:
- `Posts`

### Step 1

- `All Import > New Import`
- Upload `posts-import-real.csv`
- Pilih `New Items`
- Pilih import ke `Posts`

### Step 2

- Review record.
- Pastikan HTML artikel masih aman dibaca.

### Step 3: Drag & Drop Mapping

#### Main Content

- Title <- `post_title`
- Content <- `post_content`
- Excerpt <- `post_excerpt`
- Slug <- `post_name`
- Status <- `post_status`
- Date <- `post_date`

#### Categories and Tags

Di section taxonomies default WordPress:
- Categories <- `categories`
- Tags <- `tags`

Untuk tags:
- jika plugin meminta separator, gunakan `|`

#### Images

- Image source <- `featured_image_url`
- Aktifkan `Set the first image to the Featured Image`

#### Author

Rekomendasi paling aman:
- import dulu semua post di bawah user admin WordPress yang sedang login
- simpan `author_email` dan `author_name` sebagai reference field bila perlu

Alasan:
- theme publik sekarang tidak bergantung pada author lama untuk rendering utama
- ini mengurangi risiko mismatch author di import pertama

Jika Anda memang ingin mapping author langsung dan user WordPress-nya sudah ada, Anda bisa mencoba map berdasarkan email di section author jika tersedia di instalasi WP All Import Anda.

#### Custom Fields

Optional fields:
- `read_time` <- `meta_read_time`
- `legacy_status` <- `legacy_status`
- `legacy_id` <- `legacy_id`
- `seo_title` <- `seo_title`
- `seo_description` <- `seo_description`
- `author_email` <- `author_email`
- `author_name` <- `author_name`

### Step 4

- Unique Identifier <- `legacy_id`

### Step 5

- Run import.
- Cek archive blog dan single post.

## Validasi setelah semua import

1. Buka homepage dan pastikan section Projects, Services, Testimonials, dan Latest Insights terisi.
2. Buka archive `Projects`, `Services`, dan `Blog`.
3. Buka satu single project/post/testimonial.
4. Jika taxonomy project belum benar, edit term `ml_project_type` di WordPress lalu rerun import bila perlu.
5. Jika custom field belum tampil di frontend, cek apakah nama field di import sudah persis sama.

## Troubleshooting cepat

### Custom fields tidak muncul di mapping UI

Penyebab umum:
- WP All Import belum auto-detect field karena field itu belum pernah ada pada post `published`.

Solusi:
- tambahkan field manual dengan nama persis seperti daftar di atas.

### Featured image tidak ikut masuk

Penyebab umum:
- URL gambar tidak valid atau tidak publik.

Solusi:
- gunakan `Preview & Test`
- atau upload file ke `/wp-content/uploads/wpallimport/files/` lalu import dari server

### Taxonomy project jadi dobel

Penyebab umum:
- import memakai nama term berbeda dari slug lama

Solusi:
- gunakan nilai slug yang konsisten seperti `apartment`, `residential`, `office`, `commercial`

### Import ulang membuat duplikasi

Penyebab umum:
- Unique Identifier berubah atau import baru dibuat dari nol

Solusi:
- rerun import lama dengan `legacy_id` yang sama

## Sumber resmi yang saya pakai

- WP All Import docs overview: https://www.wpallimport.com/documentation/
- Import any CSV/XML into WordPress: https://www.wpallimport.com/documentation/importing-an-xml-or-csv-file/
- Unique Identifier guidance: https://www.wpallimport.com/documentation/define-unique-identifier-correctly/
- Custom fields import: https://www.wpallimport.com/documentation/theme-plugin-fields/
- Images from URL: https://www.wpallimport.com/documentation/import-images-from-urls/
- Images from server: https://www.wpallimport.com/documentation/importing-images-from-your-server/
- Taxonomy import: https://www.wpallimport.com/documentation/taxonomies-overview/
- Import preview: https://www.wpallimport.com/documentation/how-to-preview-an-import/
