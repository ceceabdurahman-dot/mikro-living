# MikroLiving Legacy -> WordPress Mapping

Dokumen ini memetakan struktur konten aplikasi lama ke struktur WordPress yang dipakai oleh theme `mikroliving-theme`.

## Target WordPress yang dipakai theme

- `Posts` bawaan WordPress untuk artikel / insight
- `ml_project` custom post type untuk portfolio / projects
- `ml_service` custom post type untuk services
- `ml_testimonial` custom post type untuk testimonials
- `Appearance > Customize` untuk pengaturan hero, CTA, WhatsApp, footer tagline, dan angka statistik homepage

## Ringkasan migrasi

1. Import media lebih dulu ke WordPress Media Library.
2. Import `services` ke `ml_service`.
3. Import `projects` ke `ml_project`.
4. Import `testimonials` ke `ml_testimonial`.
5. Import `blog_posts` ke `Posts` bawaan WordPress.
6. Isi setting homepage lama lewat Customizer theme.
7. Atur menu WordPress dan halaman blog jika diperlukan.

## Mapping: blog_posts -> WordPress Posts

| Legacy field | WordPress target | Catatan |
| --- | --- | --- |
| `title` | `post_title` | langsung |
| `slug` | `post_name` | langsung |
| `excerpt` | `post_excerpt` | langsung |
| `content` | `post_content` | HTML lama bisa dipakai |
| `category` enum (`trends`, `aesthetics`, `material`, `tips`, `news`) | taxonomy `category` | buat category dengan slug yang sama |
| `tags` JSON | taxonomy `post_tag` | ubah array JSON menjadi tag WP |
| `status` (`draft`, `published`, `archived`) | `post_status` | `published -> publish`, `draft -> draft`, `archived -> draft` atau `private` |
| `cover_url` | Featured Image | upload ke Media Library lalu set thumbnail |
| `author_id` | `post_author` | map ke user WordPress |
| `read_time` | optional custom field | belum dipakai theme publik, boleh disimpan sebagai post meta |
| `published_at` | `post_date` | gunakan tanggal publish lama |
| `meta_title` | optional SEO plugin field | mis. Rank Math / Yoast |
| `meta_desc` | optional SEO plugin field | mis. Rank Math / Yoast |
| `views` | diabaikan / analytics baru | tidak perlu dimigrasi |

## Mapping: projects -> ml_project

| Legacy field | WordPress target | Catatan |
| --- | --- | --- |
| `title` | `post_title` | langsung |
| `slug` | `post_name` | langsung |
| `description` | `post_content` | langsung |
| `status` (`draft`, `published`, `archived`) | `post_status` | `published -> publish`, `draft -> draft`, `archived -> draft` atau `private` |
| `cover_url` | Featured Image | upload ke Media Library lalu set thumbnail |
| `location` | post meta `location` | sudah dipakai theme |
| `area_sqm` | post meta `area` | simpan sebagai teks, mis. `45 sqm` |
| `category` enum (`apartment`, `house`, `office`, `retail`, `hospitality`, `other`) | taxonomy `ml_project_type` | disarankan buat term dengan slug yang sama |
| `client_name` | optional post meta `client_name` | boleh disimpan untuk kebutuhan detail project |
| `year_completed` | optional post meta `year_completed` | boleh disimpan |
| `is_featured` | manual sorting / curation | theme saat ini menampilkan project terbaru, jadi featured lama perlu dipilih manual lewat urutan konten |
| `sort_order` | manual ordering | WP bawaan tidak memakai ini otomatis di frontend |
| `meta_title` | optional SEO plugin field | |
| `meta_desc` | optional SEO plugin field | |
| `project_images[]` | gallery media / blok gallery | theme sekarang belum memakai gallery multi-image otomatis |

## Mapping: services -> ml_service

| Legacy field | WordPress target | Catatan |
| --- | --- | --- |
| `title` | `post_title` | langsung |
| `slug` | `post_name` | langsung |
| `description` | `post_content` atau `post_excerpt` | theme memakai excerpt/content ringkas |
| `icon_url` | Featured Image | paling rapi untuk WP |
| `icon` | post meta `short_label` | pakai singkatan seperti `ID`, `AD`, `CF`, `DB` |
| `features` JSON | isi ke `post_content` dalam bullet list | karena lebih mudah dikelola editor WP |
| `price_from` | optional post meta `price_from` | belum dipakai theme publik |
| `is_active` | `post_status` atau seleksi manual | `true -> publish`, `false -> draft` |
| `sort_order` | urutan manual publish | WP bawaan tidak otomatis membaca `sort_order` |

## Mapping: testimonials -> ml_testimonial

| Legacy field | WordPress target | Catatan |
| --- | --- | --- |
| `client_name` | `post_title` | jadi nama klien |
| `content` | `post_content` / `post_excerpt` | kutipan testimonial |
| `client_title` | post meta `client_role` | mis. nama proyek / jabatan |
| `avatar_url` | Featured Image | upload ke Media Library |
| `rating` | post meta `rating` | opsional |
| `project_id` | manual relation | jika perlu, simpan sebagai catatan di content atau meta tambahan |
| `is_featured` | curation manual | theme saat ini mengambil testimonial terbaru |
| `is_active` | `post_status` | `true -> publish`, `false -> draft` |
| `sort_order` | manual ordering | tidak otomatis dipakai theme |

## Mapping: site_settings -> Theme Customizer

| Legacy key | WordPress target |
| --- | --- |
| `site_name` | `Settings > General > Site Title` |
| `site_tagline` | `Settings > General > Tagline` |
| `site_description` | `Appearance > Customize > Hero Description` |
| `studio_founded` | `Appearance > Customize > Studio Stat 1 Value` |
| `stat_projects` | `Appearance > Customize > Hero Stat 1 Value` |
| `stat_satisfaction` | `Appearance > Customize > Hero Stat 2 Value` |
| `stat_experience` | `Appearance > Customize > Hero Stat 3 Value` |
| `stat_cities` | `Appearance > Customize > Studio Stat 2 Value` |
| `stat_awards` | `Appearance > Customize > Studio Stat 3 Value` |
| `contact_whatsapp` | `Appearance > Customize > WhatsApp URL` |
| `seo_title`, `seo_description`, `seo_keywords` | plugin SEO opsional |

## Data yang belum masuk theme WordPress ini

- `team_members`
- `consultation_requests`
- CMS custom role / workflow `superadmin`, `admin`, `editor`
- gallery project multi-image otomatis di frontend
- analytics seperti `views`

## Rekomendasi praktis saat import

- Untuk status `archived`, simpan sebagai `draft` dulu supaya aman.
- Untuk `area_sqm`, simpan sebagai teks jadi lebih fleksibel, mis. `45 sqm` atau `120 sqm`.
- Untuk `features` service, lebih bagus diubah ke bullet list dalam editor WordPress.
- Untuk featured image, gunakan file lokal asli bila ada, bukan hanya URL CDN lama.
- Setelah theme aktif, buka `Settings > Permalinks` lalu klik Save sekali agar rewrite archive WordPress segar.
