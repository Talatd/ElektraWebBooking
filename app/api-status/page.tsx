import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ApiStatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">🔍 API İstekleri Durumu</CardTitle>
          <p className="text-gray-600">
            Projede kullanılan tüm API istekleri ve veri kaynakları
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Real API Calls */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600">
              ✅ Gerçek API İstekleri (Server-Side)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div>
                  <code className="text-sm">GET /hotel/23155/params</code>
                  <p className="text-xs text-gray-600">Otel bilgileri, görseller, iletişim</p>
                </div>
                <Badge variant="outline" className="text-green-700">Cache: 1h</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div>
                  <code className="text-sm">GET /hotel/23155/hotel-definitions</code>
                  <p className="text-xs text-gray-600">Oda tipleri, pansiyon türleri</p>
                </div>
                <Badge variant="outline" className="text-green-700">Cache: 24h</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div>
                  <code className="text-sm">GET /hotel/23155/price</code>
                  <p className="text-xs text-gray-600">Fiyatlar ve müsaitlik (Real-time)</p>
                </div>
                <Badge variant="outline" className="text-red-700">No Cache</Badge>
              </div>
            </div>
          </div>

          {/* API Call Locations */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">
              📍 API İsteklerinin Yapıldığı Yerler
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded">
                <code className="text-sm font-medium">app/page.tsx</code>
                <p className="text-xs text-gray-600 mt-1">
                  🌐 getHotelParams() - Ana sayfa otel bilgileri
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded">
                <code className="text-sm font-medium">app/rezervasyon/page.tsx</code>
                <p className="text-xs text-gray-600 mt-1">
                  🌐 getHotelParams() + getPriceOffers() + getHotelDefinitions()
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded">
                <code className="text-sm font-medium">lib/api.ts</code>
                <p className="text-xs text-gray-600 mt-1">
                  🔧 Tüm API fonksiyonları burada tanımlı
                </p>
              </div>
            </div>
          </div>

          {/* Client vs Server */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-600">
              🖥️ Client vs Server İstekleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded">
                <h4 className="font-medium text-purple-800 mb-2">Server-Side (✅)</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Tüm API istekleri server-side</li>
                  <li>• Environment variables güvenli</li>
                  <li>• SEO dostu</li>
                  <li>• Cache stratejileri aktif</li>
                </ul>
              </div>
              
              <div className="p-4 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-800 mb-2">Client-Side (❌)</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Hiç client-side API isteği yok</li>
                  <li>• Form sadece navigation yapıyor</li>
                  <li>• Componentler sadece UI render ediyor</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-600">
              📊 Veri Kaynakları
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <span className="text-sm">Otel Adı, Açıklama, Adres</span>
                <Badge className="bg-green-100 text-green-800">API</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <span className="text-sm">Otel Görselleri</span>
                <Badge className="bg-green-100 text-green-800">API</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <span className="text-sm">İletişim Bilgileri</span>
                <Badge className="bg-green-100 text-green-800">API</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <span className="text-sm">Otel Olanakları</span>
                <Badge className="bg-green-100 text-green-800">API</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <span className="text-sm">Oda Fiyatları ve Müsaitlik</span>
                <Badge className="bg-green-100 text-green-800">API (Real-time)</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <span className="text-sm">Oda Tipleri ve Özellikleri</span>
                <Badge className="bg-green-100 text-green-800">API</Badge>
              </div>
            </div>
          </div>

          {/* Environment */}
          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">🔐 Environment Variables</h4>
            <p className="text-sm text-yellow-700">
              <code>ELEKTRA_API_TOKEN</code> - API authentication için kullanılıyor
            </p>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="font-medium mb-2">📋 Özet</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Tüm veriler gerçek API'den geliyor</li>
              <li>✅ Hiç statik/mock data yok</li>
              <li>✅ Server-side rendering</li>
              <li>✅ Optimum cache stratejileri</li>
              <li>✅ Real-time fiyat verileri</li>
              <li>✅ Güvenli API token kullanımı</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
