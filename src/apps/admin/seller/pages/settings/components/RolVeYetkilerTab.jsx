import React from 'react';
import Icon from '@shared/components/AppIcon';

const RolVeYetkilerTab = ({ roles, handleAddRole, handleEditRole, handleEditPermissions, handleDeleteRole }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Rol ve Yetki Yönetimi</h3>
        <button
          onClick={handleAddRole}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Icon name="Plus" size={16} />
          <span>Yeni Rol</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol Adı
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Açıklama
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Yetki Sayısı
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sistem Rolü
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  <div className="text-xs text-gray-500">{role.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{role.description || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {role.permissions.includes('*') ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      Tüm Yetkiler
                    </span>
                  ) : (
                    <div className="text-sm text-gray-900">{role.permissions.length} yetki</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ['admin', 'manager', 'seller', 'customer'].includes(role.id) 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {['admin', 'manager', 'seller', 'customer'].includes(role.id) ? 'Evet' : 'Hayır'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditPermissions(role)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Yetkiler
                    </button>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Düzenle
                    </button>
                    {!['admin', 'manager', 'seller', 'customer'].includes(role.id) && (
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Rol ve Yetki Sistemi Hakkında</p>
            <p>Rol ve yetki sistemi, kullanıcıların sistem içerisindeki erişim yetkilerini yönetmenizi sağlar. Her rol belirli yetkilere sahiptir ve kullanıcılara bu roller atanarak erişim kontrol edilir.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Sistem rolleri (Ana Yönetici, Yönetici, Satıcı, Müşteri) silinemez.</li>
              <li>Özel roller oluşturarak kendi yetki setlerinizi tanımlayabilirsiniz.</li>
              <li>Bir role "Tüm Yetkiler" vererek tam erişim sağlayabilirsiniz.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolVeYetkilerTab;