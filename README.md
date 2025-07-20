# Nora Akademi - Matematik Eğitim Web Sitesi

Modern, animasyonlu ve profesyonel bir matematik eğitim web sitesi. Nora Akademi'nin matematik hocaları ve online ders paketlerini tanıtan responsive web sitesi.

## 🚀 Özellikler

### ✨ Modern Tasarım
- **Gradient Renkler**: Modern mor-mavi gradient renk paleti
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Glassmorphism Efektleri**: Şeffaf ve bulanık arka plan efektleri
- **Modern Tipografi**: Poppins font ailesi

### 🎭 Animasyonlar
- **AOS (Animate On Scroll)**: Sayfa kaydırma animasyonları
- **Floating Animasyonlar**: Yüzen kartlar ve şekiller
- **Hover Efektleri**: İnteraktif hover animasyonları
- **Parallax Efektleri**: Derinlik hissi veren parallax animasyonlar
- **Typing Effect**: Yazı yazma animasyonu
- **Counter Animasyonları**: Sayı sayaç animasyonları

### 📱 Responsive Özellikler
- **Mobile-First**: Mobil öncelikli tasarım
- **Hamburger Menü**: Mobil navigasyon menüsü
- **Flexible Grid**: Esnek grid sistemi
- **Touch-Friendly**: Dokunmatik cihaz uyumlu

### 🎯 Bölümler

#### 1. Hero Section
- Etkileyici başlık ve açıklama
- Call-to-action butonları
- Animasyonlu arka plan şekilleri
- Floating matematik kartı

#### 2. Hakkımızda
- Nora Akademi tanıtımı
- Özellikler listesi
- İstatistik kartları (animasyonlu sayaçlar)

#### 3. Hocalarımız
- Matematik hocaları profilleri
- Hover efektli kartlar
- Uzmanlık alanları etiketleri

#### 4. Ders Paketleri
- 3 farklı paket seçeneği
- Fiyatlandırma tablosu
- Özellik listeleri
- "En Popüler" rozeti

#### 5. İletişim
- İletişim bilgileri
- İletişim formu
- Form validasyonu
- Bildirim sistemi

## 🛠️ Teknolojiler

- **HTML5**: Semantik markup
- **CSS3**: Modern CSS özellikleri
  - Flexbox ve Grid
  - CSS Animations
  - CSS Variables
  - Media Queries
- **JavaScript (ES6+)**: 
  - Vanilla JavaScript
  - Intersection Observer API
  - Event Listeners
  - DOM Manipulation
- **AOS Library**: Scroll animasyonları
- **Font Awesome**: İkonlar
- **Google Fonts**: Poppins font

## 📁 Dosya Yapısı (Vercel için Önerilen)

```
noraonline/
├── index.html
├── styles.css
├── script.js
├── images/
│   ├── ayse.jpeg
│   ├── ecem.jpeg
│   └── logonet.png
└── README.md
```

- Tüm dosyalar kök dizinde olmalı.
- Görseller `images/` klasöründe olmalı.
- Ekstra bir yapılandırma gerekmez.

## 🚀 Vercel ile Yayınlama Adımları

1. [Vercel](https://vercel.com/) hesabı açın.
2. Proje klasörünüzü bir GitHub reposuna yükleyin (veya Vercel'e doğrudan yükleyin).
3. Vercel panelinde “New Project” → GitHub reposunu seçin veya dosyaları yükleyin.
4. Proje ayarlarında **Framework Preset** olarak `Other` veya `Static` seçin.
5. Deploy edin, otomatik olarak bir canlı link oluşur.
6. Alan adı bağlamak için Vercel panelinden domain ekleyebilirsiniz.

> **Not:** `index.html` dosyanız kök dizinde olmalı, aksi halde Vercel ana sayfanızı bulamaz.

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Primary**: #667eea (Mavi)
- **Secondary**: #764ba2 (Mor)
- **Background**: #f5f7fa (Açık gri)
- **Text**: #333 (Koyu gri)
- **Accent**: #bdc3c7 (Orta gri)

### Animasyonlar
- **Float Animation**: 6s süreli yüzen animasyon
- **Move Animation**: 20s süreli hareket animasyonu
- **Fade Animations**: AOS ile fade efektleri
- **Hover Transitions**: 0.3s smooth geçişler

## 🚀 Kurulum ve Çalıştırma

1. **Dosyaları İndirin**
   ```bash
   git clone [repository-url]
   cd noraonline
   ```

2. **Web Sunucusu Başlatın**
   - Dosyaları bir web sunucusuna yükleyin
   - Veya local sunucu kullanın:
   ```bash
   # Python ile
   python -m http.server 8000
   
   # Node.js ile
   npx serve .
   ```

3. **Tarayıcıda Açın**
   ```
   http://localhost:8000
   ```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🎯 Özellikler Detayı

### Navigasyon
- Fixed navbar
- Smooth scrolling
- Mobile hamburger menu
- Active link highlighting

### Hero Section
- Gradient background
- Animated shapes
- Floating card
- Typing effect

### İstatistikler
- Counter animations
- Intersection Observer
- Hover effects

### Form İşlemleri
- Form validation
- Notification system
- Success/error messages
- Auto-reset

### Performans
- Optimized images
- Lazy loading
- Smooth animations
- Efficient CSS

## 🔧 Özelleştirme

### Renkleri Değiştirme
CSS dosyasındaki CSS variables'ları düzenleyin:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --background-color: #f5f7fa;
}
```

### Animasyon Hızlarını Ayarlama
JavaScript dosyasında AOS ayarlarını düzenleyin:

```javascript
AOS.init({
    duration: 1000,    // Animasyon süresi
    easing: 'ease-in-out',
    once: true,
    mirror: false
});
```

## 📞 İletişim

- **Website**: norakademi.online
- **Email**: info@norakademi.online
- **Telefon**: +90 212 555 0123

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

---

**Nora Akademi** - Matematik eğitiminde kalite ve başarı odaklı yaklaşım 
Getform !!!
