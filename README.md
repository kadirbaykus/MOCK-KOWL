# KOWL — Kahve Karavanı

Tarayıcıda oynanan gerçek 3B kahve karavanı tycoon prototipi. Three.js ile özgün, sıcak renkli bir park sahnesi; KOWL karavanı ve üç boyutlu baykuş tabelası içerir. Harici görsel veya ücretli API gerektirmez.

## GitHub Codespaces'te çalıştır

Terminali bu dosyanın ve package.json'ın bulunduğu klasörde aç:

```bash
npm ci
npm run dev -- --port 5173
```

Bağlantı Noktaları / Ports bölümünden 5173 satırındaki tarayıcı simgesini aç. Bu sunucu terminal açıkken çalışır. WebGL destekleyen güncel Chrome, Brave, Edge veya Safari kullan. Uygulama kurulumu ve Android emülatörü gerekmez.

## Oyna

- Sahneyi sürükleyerek döndür; iki parmak veya +/− ile yakınlaş.
- Sıradaki müşterinin istediği tarifi Menü bölümünden seç, kahveyi hazırla.
- Tedarik bölümünden çekirdek ve süt al.
- Makineyi geliştirerek latte ve mocha tariflerini aç.
- Karavanı büyüt, satış kazancını artır; barista alarak üretimi otomatikleştir.
- İlerleme bu tarayıcının localStorage alanına kaydedilir. Gizli sekmede veya farklı adreste kayıt paylaşılmaz. Bulut kaydı yoktur.

## Kontroller

```bash
npm run build
node --test tests/game.test.js
npm exec playwright test
```

Tarayıcı testleri için sistem Chromium'u `/usr/bin/chromium` yolunda beklenir. Farklı bir sistemde `CHROMIUM_PATH` belirt veya Playwright yapılandırmasını kendi tarayıcı kurulumuna göre ayarla.

## GitHub'a kaydet

Yalnızca bu proje dosyalarını seçerek commit oluştur. node_modules ve dist yükleme. Codespaces'te kaydetmek tek başına GitHub'a göndermez; Source Control bölümündeki Commit ve Sync Changes işlemlerini kullan.

## Kapsam

İlk oynanabilir prototip: üç tarif, stok, müşteri sırası, satış, üçer makine ve karavan seviyesi, otomatik barista ve yerel kayıt. Hay Day varlıkları kullanılmaz. Bölgeler, dekorasyon yerleştirme, ses, gün/gece, görev ödülleri ve bulut kaydı sonraki sürümler içindir. Bu proje GitHub Pages'e henüz yayımlanmamıştır.

## Kolay aktarım: tek dosya

`npm run build` ardından `node scripts/export.mjs` çalıştırmak `export/index.html` üretir. Bu dosya derlenmiş gerçek 3B oyunun tamamını içerir; ayrı kütüphane indirmez. Mevcut basit HTML dosyanın yedeğini aldıktan sonra yerine koyabilirsin. Codespaces'te bu dosyanın bulunduğu klasörde `python3 -m http.server 8000` çalıştır ve 8000 portunu tarayıcıda aç. Kaynak kodunu geliştirmek için `src/` ve Vite akışını kullan.
