const { Client } = require('pg');
const fs = require('fs');

async function deploySchema() {
  const client = new Client({
    connectionString: 'postgresql://postgres:QnyvOXoPAyGslhopdUKwFgtXBeSVHqZl@shortline.proxy.rlwy.net:29704/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Bağlantı başarılı!');

    // Mevcut tabloları temizle
    const drops = [
      'DROP TABLE IF EXISTS order_status_history CASCADE;',
      'DROP TABLE IF EXISTS order_items CASCADE;',
      'DROP TABLE IF EXISTS orders CASCADE;',
      'DROP TABLE IF EXISTS inventory_movements CASCADE;',
      'DROP TABLE IF EXISTS user_sessions CASCADE;',
      'DROP TABLE IF EXISTS settings CASCADE;',
      'DROP TABLE IF EXISTS products CASCADE;',
      'DROP TABLE IF EXISTS categories CASCADE;',
      'DROP TABLE IF EXISTS customers CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP SEQUENCE IF EXISTS order_number_seq CASCADE;'
    ];

    for (const drop of drops) {
      try { await client.query(drop); } catch (e) { }
    }
    console.log('✅ Temizlik tamamlandı!');

    // Schema dosyasını oku ve çalıştır
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    await client.query(schema);
    console.log('✅ Schema deploy edildi!');

    // Kontrol
    const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`);
    console.log('\n📋 Tablolar:');
    tables.rows.forEach(row => console.log(`  ✅ ${row.table_name}`));

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await client.end();
  }
}

deploySchema();