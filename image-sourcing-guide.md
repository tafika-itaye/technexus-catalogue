# Image Sourcing Guide — TechNexus Catalogue

## Universal rules

- **Format:** JPG for photos (preferred). PNG only if you get a transparent-background press cut-out.
- **Minimum source dimensions:** 1200 x 900 px. Larger is fine — the optimizer will downscale to 1600 px max edge.
- **File size:** Don't worry about it pre-optimization. `scripts/optimize_images.py` shrinks to ≤300 KB and generates -1200/-800/-400 WebP variants automatically.
- **Source priority:**
  1. Official vendor press / media kit (mikrotik.com/products, lenovo.com/press, hp.com/press, dell.com/press)
  2. Vendor support image URLs (search `site:support.lenovo.com <model>` or `site:support.hp.com <model>`)
  3. Reputable distributors with clean product shots (B&H Photo, CDW, Amazon Business, Newegg Business)
  4. Google Images → Tools → Size: Large + Type: Photo
- **Avoid:** watermarked stock photos, 3D renders with reflective desks, user-uploaded photos with cables/accessories, small thumbnails.

## Workflow

1. Save each image at the exact path in the table below.
2. From the repo root run: `python3 scripts/optimize_images.py` (shrinks + emits WebP variants).
3. Run: `python3 scripts/build_catalogue.py` — it auto-detects each JPG and swaps the `<img src>` from the SVG placeholder to the real photo.
4. Preview locally, then `git add images/ catalogue.html && git commit && git push`.

## Per-SKU sourcing table

| SKU | Save as (path + filename) | Search terms (primary) | Fallback search |
|-----|---------------------------|------------------------|-----------------|
| **MT-CCR2116-12G-4S+** | `images/networking/routers/mikrotik-ccr2116-12g-4sfp.jpg` | mikrotik ccr2116-12g-4s+ product press image | ccr2116 12g 4sfp+ official mikrotik.com |
| **MT-CCR2216-1G-12XS-2XQ** | `images/networking/routers/mikrotik-ccr2216-1g-12xs-2xq.jpg` | mikrotik ccr2216 1g 12xs 2xq 100g router | ccr2216 official product photo mikrotik |
| **MT-CCR2004-16G-2S+** | `images/networking/routers/mikrotik-ccr2004-16g-2sfp.jpg` | mikrotik ccr2004 16g 2s+ png | ccr2004-16g-2sfp cloud core router image |
| **MT-CCR2004-1G-12S+2XS** | `images/networking/routers/mikrotik-ccr2004-12sfp-2xs.jpg` | mikrotik ccr2004 1g 12s+ 2xs 25g | ccr2004 12sfp+ aggregation router |
| **MT-RB5009UPR+S+IN** | `images/networking/routers/mikrotik-rb5009upr-s-in.jpg` | mikrotik rb5009upr+s+in poe router | rb5009 upr product image |
| **MT-RB5009UG+S+IN** | `images/networking/routers/mikrotik-rb5009ug-s-in.jpg` | mikrotik rb5009ug+s+in router | rb5009 ug s in press photo |
| **MT-RB4011iGS+RM** | `images/networking/routers/mikrotik-rb4011igs-rm.jpg` | mikrotik rb4011igs+rm rackmount | rb4011 igs rm 10 gigabit router |
| **MT-RB1100DX4** | `images/networking/routers/mikrotik-rb1100dx4.jpg` | mikrotik rb1100ahx4 dude edition | rb1100dx4 rackmount router |
| **MT-L009UIGS-RM** | `images/networking/routers/mikrotik-l009uigs-rm.jpg` | mikrotik l009uigs-rm router | l009 uigs rm rackmount |
| **MT-CRS354-48G-4S+2Q+RM** | `images/networking/switches/mikrotik-crs354-48g-4sfp-2qsfp.jpg` | mikrotik crs354-48g-4s+2q+rm switch | crs354 48 port gigabit 40g uplink |
| **MT-CRS354-48P-4S+2Q+RM** | `images/networking/switches/mikrotik-crs354-48p-poe.jpg` | mikrotik crs354-48p-4s+2q+rm poe | crs354 48 port poe switch mikrotik |
| **MT-CRS328-24P-4S+RM** | `images/networking/switches/mikrotik-crs328-24p-4sfp-rm.jpg` | mikrotik crs328-24p-4s+rm poe switch | crs328 24 port poe+ image |
| **MT-CRS326-24G-2S+RM** | `images/networking/switches/mikrotik-crs326-24g-2sfp-rm.jpg` | mikrotik crs326-24g-2s+rm switch | crs326 24 gigabit 2 sfp+ rackmount |
| **MT-CRS326-24S+2Q+RM** | `images/networking/switches/mikrotik-crs326-24sfp-2qsfp.jpg` | mikrotik crs326-24s+2q+rm 10g 40g | crs326 24 sfp+ 2 qsfp+ aggregation |
| **MT-CRS318-16P-2S+OUT** | `images/networking/switches/mikrotik-crs318-16p-netpower-outdoor.jpg` | mikrotik crs318-16p-2s+out netpower | crs318 outdoor poe switch |
| **MT-CRS112-8P-4S-IN** | `images/networking/switches/mikrotik-crs112-8p-4s-in.jpg` | mikrotik crs112-8p-4s-in poe | crs112 8 port poe smart switch |
| **MT-S+85DLC03D** | `images/networking/transceivers/mikrotik-sfp-plus-sr-10g-transceiver.jpg` | mikrotik s+85dlc03d sfp+ 10g sr | sfp+ 10gbase-sr 850nm module |
| **MT-S+RJ10** | `images/networking/transceivers/mikrotik-sfp-plus-rj45-copper.jpg` | mikrotik s+rj10 10g copper sfp+ | sfp+ rj45 10g copper module |
| **LEN-TP-E14-C5** | `images/laptops/lenovo-thinkpad-e14-gen6-core5.jpg` | lenovo thinkpad e14 gen6 core 5 210h | thinkpad e14 21t9 press image |
| **LEN-TP-E14-U7** | `images/laptops/lenovo-thinkpad-e14-ultra7.jpg` | lenovo thinkpad e14 ultra 7 155h | thinkpad e14 21m7 ultra 7 wuxga |
| **LEN-TP-E16-R7** | `images/laptops/lenovo-thinkpad-e16-ryzen7.jpg` | lenovo thinkpad e16 ryzen 7 7735hs | thinkpad e16 21m5 amd press photo |
| **HP-PB440-G11** | `images/laptops/hp-probook-440-g11-ultra5.jpg` | hp probook 440 g11 ultra 5 125u | probook 440 g11 d3nu2at image |
| **LEN-TC-NEO50S-I3** | `images/desktops/sff/lenovo-thinkcentre-neo-50s-sff.jpg` | lenovo thinkcentre neo 50s sff gen4 | thinkcentre neo 50s 12jh press image |
| **LEN-TC-NEO50T-I3** | `images/desktops/tower/lenovo-thinkcentre-neo-50t-tower.jpg` | lenovo thinkcentre neo 50t gen5 tower | neo 50t 12ud tower press photo |
| **LEN-TC-NEO30S-I5** | `images/desktops/mini/lenovo-thinkcentre-neo-30s-mini.jpg` | lenovo thinkcentre neo 30s gen5 tiny | neo 30s 13dk mini pc image |
| **LEN-TC-NEO50T-I5** | `images/desktops/tower/lenovo-thinkcentre-neo-50t-i5.jpg` | lenovo thinkcentre neo 50t gen5 i5-13400 | neo 50t i5 tower |
| **LEN-TC-M70S-I5** | `images/desktops/sff/lenovo-thinkcentre-m70s-sff.jpg` | lenovo thinkcentre m70s sff i5-14400 | m70s sff press photo |
| **LEN-TC-M70T-I7** | `images/desktops/tower/lenovo-thinkcentre-m70t-tower.jpg` | lenovo thinkcentre m70t tower i7-14700 | m70t tower press image |
| **HP-290-G9-I5** | `images/desktops/tower/hp-290-g9-tower-i5.jpg` | hp 290 g9 tower i5-14400 | hp 290 g9 ct6y5et product image |
| **HP-290-G9-I7** | `images/desktops/tower/hp-290-g9-tower-i7.jpg` | hp 290 g9 tower i7-14700 | hp 290 g9 ca7y3at |
| **HP-400-SFF-I7** | `images/desktops/sff/hp-pro-400-g9-sff-i7.jpg` | hp pro 400 g9 sff i7-14700 | hp pro 400 g9 99q64et |
| **HP-800-G9-SFF-I7** | `images/desktops/sff/hp-elitedesk-800-g9-sff-i7.jpg` | hp elitedesk 800 g9 sff i7 | hp 800 g9 sff press image |
| **DEL-7020-I3** | `images/desktops/tower/dell-optiplex-7020-tower.jpg` | dell optiplex 7020 tower i3 14th gen | optiplex 7020 mt press image |
| **DEL-QCT1250-I5** | `images/desktops/sff/dell-optiplex-qct1250-sff.jpg` | dell optiplex qct1250 i5 | optiplex sff press photo |
| **DEL-MINI-U5** | `images/desktops/mini/dell-optiplex-mini-pro-qcm1250.jpg` | dell optiplex mini pro qcm1250 ultra 5 235t | dell mini pro mff image |