const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Environment variables'dan bağlantı bilgilerini al
require('dotenv').config({ path: '.env.production' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function deployCleanDatabase() {
  try {
    console.log('🔌 PostgreSQL bağlantısı kuruluyor...');
    await client.connect();
    console.log('✅ PostgreSQL bağlantısı başarılı!');

    // Mevcut tabloları temizle
    console.log('\n🧹 Mevcut tablolar temizleniyor...');
    const dropQueries = [
      'DROP TABLE IF EXISTS orders CASCADE;',
      'DROP TABLE IF EXISTS products CASCADE;',
      'DROP TABLE IF EXISTS customers CASCADE;',
      'DROP TABLE IF EXISTS categories CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;'
    ];

    for (const query of dropQueries) {
      await client.query(query);
      console.log(`✅ ${query}`);
    }

    // Migration dosyasını oku ve çalıştır
    console.log('\n📄 Migration dosyası okunuyor...');
    const migrationPath = path.join(__dirname, 'backup', 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Migration çalıştırılıyor...');
    await client.query(migrationSQL);
    console.log('✅ Migration başarıyla tamamlandı!');

    // Oluşturulan tabloları kontrol et
    console.log('\n📊 Oluşturulan tablolar kontrol ediliyor...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Oluşturulan tablolar:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Her tablodaki kayıt sayısını kontrol et
    console.log('\n📈 Tablo kayıt sayıları:');
    const tables = ['users', 'categories', 'products', 'customers', 'orders'];
    
    for (const table of tables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  - ${table}: ${countResult.rows[0].count} kayıt`);
      } catch (err) {
        console.log(`  - ${table}: Tablo bulunamadı`);
      }
    }

    console.log('\n🎉 Database temizleme ve kurulum tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Bağlantı kapatıldı.');
  }
}

deployCleanDatabase();