// Test script for user creation issue
import authService from './src/services/authService.js';
import storage from './src/core/storage/index.js';

// Test user creation functionality
async function testUserCreation() {
  console.log('🧪 TESTING USER CREATION...');
  
  try {
    // Clear existing users for clean test
    await storage.set('users', []);
    
    // Test kullanıcı verisi - güçlü password ile
    const testUserData = {
      email: 'test@example.com',
      password: 'TestPassword123!', // Güçlü password: büyük, küçük, sayı, özel karakter
      name: 'Test User',
      username: 'testuser',
      phone: '+90 555 123 4567',
      role: 'customer'
    };
    
    // Zayıf password testi için
    const weakPasswordData = {
      email: 'weak@example.com',
      password: '123', // Zayıf password
      name: 'Weak User'
    };
    
    console.log('👤 Creating test user with data:', {
      email: testUserData.email,
      username: testUserData.username,
      role: testUserData.role
    });
    
    // Test 1: Zayıf password ile kayıt denemesi (başarısız olmalı)
    console.log('\n🔒 Testing weak password validation...');
    const weakResult = await authService.signUp(
      weakPasswordData.email,
      weakPasswordData.password,
      {
        name: weakPasswordData.name
      }
    );
    
    if (!weakResult.success) {
      console.log('✅ Weak password correctly rejected:', weakResult.error);
    } else {
      console.log('❌ Weak password was accepted (BUG!):', weakResult);
    }
    
    // Test 2: Güçlü password ile kayıt (başarılı olmalı)
    console.log('\n🔒 Testing strong password validation...');
    const result = await authService.signUp(
      testUserData.email,
      testUserData.password,
      {
        name: testUserData.name,
        username: testUserData.username,
        phone: testUserData.phone,
        role: testUserData.role
      }
    );
    
    console.log('✅ User creation result:', {
      success: result.success,
      userId: result.user?.id,
      email: result.user?.email,
      username: result.user?.username,
      error: result.error
    });
    
    // Verify storage
    const users = await storage.get('users', []);
    
    console.log('📊 Storage verification:');
    console.log('- users count:', users.length);
    
    if (users.length > 0) {
      console.log('- first user:', {
        id: users[0].id,
        email: users[0].email,
        username: users[0].username,
        role: users[0].role,
        isActive: users[0].isActive
      });
    }
    
    // Test login with created user
    if (result.success) {
      console.log('🔐 Testing login with created user...');
      const loginResult = await authService.login(
        testUserData.email,
        testUserData.password
      );
      
      console.log('🔐 Login result:', {
        success: loginResult.success,
        error: loginResult.error
      });
    }
    
    return {
      success: result.success,
      userId: result.user?.id,
      email: result.user?.email,
      error: result.error
    };
    
  } catch (error) {
    console.error('❌ User creation test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run test
testUserCreation().then(result => {
  console.log('🏁 Test completed:', result);
}).catch(error => {
  console.error('💥 Test execution failed:', error);
});