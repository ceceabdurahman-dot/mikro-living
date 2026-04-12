# MikroLiving WordPress Theme

Theme ini dibuat untuk memindahkan website publik MikroLiving ke WordPress klasik, dengan data yang diambil dari REST API bawaan WordPress.

## Struktur minimal

- style.css
- functions.php
- index.php

## File penting lain

- front-page.php untuk homepage publik
- header.php dan footer.php untuk layout utama
- inc/rest.php untuk helper akses REST API internal WordPress
- assets/css/theme.css untuk styling
- assets/images/logo.svg untuk branding publik

## Sumber data

Theme ini memakai endpoint REST berikut:

- /wp-json/wp/v2/posts
- /wp-json/wp/v2/ml_project
- /wp-json/wp/v2/ml_service
- /wp-json/wp/v2/ml_testimonial

Custom post type Projects, Services, dan Testimonials didaftarkan langsung dari theme ini dengan show_in_rest true.

## Langkah pakai di Hostinger

1. Copy folder mikroliving-theme ke wp-content/themes/.
2. Login ke WordPress Admin.
3. Aktifkan theme MikroLiving Theme.
4. Buka Appearance > Customize untuk mengisi hero text, CTA link, WhatsApp, dan footer tagline.
5. Tambahkan konten di:
   - Posts untuk blog
   - Projects
   - Services
   - Testimonials
6. Pastikan setiap item dipublish dan diberi featured image jika ingin card tampil lebih kaya.

## Catatan migrasi

- Frontend Next.js lama tidak dipakai lagi untuk versi WordPress ini.
- CMS custom /cms lama juga tidak dipakai untuk mode WordPress; pengelolaan konten pindah ke WordPress Admin.
