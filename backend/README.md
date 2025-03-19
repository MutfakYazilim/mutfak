# Mutfak Yazılım API

Bu proje, Mutfak Yazılım için geliştirilmiş bir REST API'dir. FastAPI ve PostgreSQL kullanılarak oluşturulmuştur.

## Özellikler

- FastAPI ile REST API
- PostgreSQL veritabanı
- SQLAlchemy ORM
- Alembic ile veritabanı migrasyonları
- JWT tabanlı kimlik doğrulama
- Rol tabanlı yetkilendirme (Admin ve Restoran Sahibi)
- Subdomain bazlı erişim

## Kurulum

### Gereksinimler

- Python 3.8+
- PostgreSQL

### Adımlar

1. Projeyi klonlayın:

```bash
git clone https://github.com/yourusername/mutfakyazilim.git
cd mutfakyazilim/backend
```

2. Sanal ortam oluşturun ve etkinleştirin:

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
```

3. Bağımlılıkları yükleyin:

```bash
pip install -r requirements.txt
```

4. PostgreSQL veritabanı oluşturun:

```bash
createdb mutfakyazilim
```

5. `.env` dosyasını düzenleyin:

```
DATABASE_URL=postgresql://username:password@localhost:5432/mutfakyazilim
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_EMAIL=admin@mutfakyazilim.com
ADMIN_PASSWORD=admin123
```

6. Veritabanı migrasyonlarını çalıştırın:

```bash
alembic upgrade head
```

7. Uygulamayı başlatın:

```bash
uvicorn app.api.api:app --reload
```

## API Endpointleri

### Genel

- `GET /` - API'ye hoş geldiniz mesajı
- `POST /token` - Erişim token'ı almak için

### Admin

- `POST /admin/login` - Admin girişi
- `POST /admin/restaurants` - Yeni restoran ekle
- `GET /admin/restaurants` - Tüm restoranları listele
- `GET /admin/restaurants/{restaurant_id}` - Belirli bir restoranı getir
- `PATCH /admin/restaurants/{restaurant_id}` - Restoran bilgilerini güncelle
- `DELETE /admin/restaurants/{restaurant_id}` - Restoranı sil

### Restoran Sahibi

- `POST /restaurant/login` - Restoran sahibi girişi
- `GET /restaurant/dashboard` - Dashboard verilerini getir
- `PATCH /restaurant/settings` - Ayarları güncelle
- `GET /restaurant/platforms` - Platform linklerini getir
- `POST /restaurant/platforms` - Yeni platform linki ekle
- `PATCH /restaurant/platforms/{platform_id}` - Platform linkini güncelle
- `DELETE /restaurant/platforms/{platform_id}` - Platform linkini sil
- `GET /restaurant/feedbacks` - Geri bildirimleri getir

### Müşteri

- `POST /feedbacks` - Yeni geri bildirim ekle
- `GET /feedbacks/stats` - Geri bildirim istatistiklerini getir
- `POST /complaints` - Yeni şikayet ekle
- `GET /{restaurant_id}/feedbacks` - Belirli bir restoranın geri bildirimlerini getir
- `GET /{restaurant_id}/analytics` - Belirli bir restoranın analizlerini getir
- `GET /{restaurant_id}/platforms` - Belirli bir restoranın platform linklerini getir

## Subdomain Yapısı

- Admin: admin.mutfakyazilim.com
- Restoran Sahibi: {restaurant_id}.mutfakyazilim.com

## Geliştirme

### Yeni Migrasyon Oluşturma

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Migrasyonları Uygulama

```bash
alembic upgrade head
``` 