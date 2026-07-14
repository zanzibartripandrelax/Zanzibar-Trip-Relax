import React, { useState, useEffect } from 'react';
import { getSiteContent, saveSiteContent } from '../../lib/cmsStore';
import ProductListTable from './ProductListTable';
import ProductTabsEditor from './ProductTabsEditor';
import HolidayPackagePreview from './HolidayPackagePreview';
import { AlertTriangle } from 'lucide-react';

interface HolidayPackageCMSProps {
  session: { name: string; role: string } | null;
  onRefreshList?: () => void;
  productType?: 'tour' | 'safari' | 'kilimanjaro' | 'package' | 'transfer';
}

export default function HolidayPackageCMS({ 
  session, 
  onRefreshList, 
  productType = 'package' 
}: HolidayPackageCMSProps) {
  const [siteContent, setSiteContent] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [previewingProduct, setPreviewingProduct] = useState<any | null>(null);

  // Check RBAC Permissions
  const role = session?.role || 'Reservation Team';
  const isDriver = role === 'Driver';

  // Load and sync content
  const syncProducts = () => {
    const content = getSiteContent();
    setSiteContent(content);
    
    const allTours = content.tours || [];
    const filtered = allTours.filter((t: any) => {
      if (productType === 'package') return t.category === 'package' || t.category === 'holiday' || t.packageCategory;
      if (productType === 'tour') return t.category === 'tour' || t.category === '' || t.category === undefined;
      if (productType === 'safari') return t.category === 'safari';
      if (productType === 'kilimanjaro') return t.category === 'kilimanjaro';
      if (productType === 'transfer') return t.category === 'transfer';
      return false;
    });
    setProducts(filtered);
    if (onRefreshList) onRefreshList();
  };

  useEffect(() => {
    syncProducts();
  }, [productType]);

  // Load version history for selected product
  useEffect(() => {
    if (editingProduct?.id) {
      const stored = localStorage.getItem(`prod_versions_${editingProduct.id}`);
      if (stored) {
        setVersionHistory(JSON.parse(stored));
      } else {
        setVersionHistory([]);
      }
    }
  }, [editingProduct?.id]);

  // Autosave Background Loop
  useEffect(() => {
    if (!editingProduct) return;

    const interval = setInterval(() => {
      handleSave(editingProduct, true);
    }, 30000); // Trigger silent autosave every 30 seconds

    return () => clearInterval(interval);
  }, [editingProduct]);

  // Create template scaffolding
  const handleCreateNew = () => {
    const newId = `${productType}-${Date.now()}`;
    const codePrefix = productType.slice(0, 3).toUpperCase();
    
    let baseProduct: any = {
      id: newId,
      title: '',
      slug: '',
      code: `${codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      category: productType,
      status: 'Draft',
      bestSeller: false,
      featured: false,
      recommended: false,
      durationDays: productType === 'transfer' ? 1 : 5,
      durationNights: productType === 'transfer' ? 0 : 4,
      duration: productType === 'transfer' ? '1 Hour' : '5 Days / 4 Nights',
      destinations: productType === 'transfer' ? 'Airport to Stone Town' : 'Stone Town, Nungwi Beach',
      basePrice: productType === 'transfer' ? 45 : 450,
      price: productType === 'transfer' ? '45' : '450',
      lastUpdated: new Date().toISOString(),
      updatedBy: session?.name || 'Staff Member',
      gallery: [],
      detailedItinerary: [],
      faqs: [],
      reviews: [],
      accommodations: [],
      whatsIncluded: ['Licensed English Speaking Guide', 'Bottled mineral water', 'Private AC vehicle entry'],
      whatsExcluded: ['Graturities and personal shopping tips', 'Visa and medical insurance'],
    };

    if (productType === 'tour') {
      baseProduct = {
        ...baseProduct,
        pickup: 'Stone Town Excursion Point',
        meetingPoint: 'Forodhani Gardens Clocktower',
        boat: 'Traditional Swahili Dhow with canopy',
        guide: 'Licensed Swahili Historian'
      };
    } else if (productType === 'safari') {
      baseProduct = {
        ...baseProduct,
        safariVehicle: '4x4 Open-Roof Toyota Land Cruiser',
        wildlife: 'The Big Five: Lion, Leopard, Elephant, Buffalo, Rhino',
        gameDrives: 'Daily Early Morning & Afternoon Game Drives',
        parkFees: 50
      };
    } else if (productType === 'kilimanjaro') {
      baseProduct = {
        ...baseProduct,
        route: 'Machame Route (Whiskey Route)',
        difficulty: 'Challenging',
        elevation: '5,895 meters',
        acclimatization: 'High success climb rate schedule',
        emergencyProcedures: 'First aid kits, oxygen concentrators, and helicopter rescue response ready'
      };
    } else if (productType === 'transfer') {
      baseProduct = {
        ...baseProduct,
        pickupZone: 'Zanzibar International Airport (ZNZ)',
        destination: 'Nungwi Resorts',
        vehicleCapacity: '6 Pax with luggage',
        waitingTime: '60 minutes free of charge',
        flightNumber: 'QR-1482',
        childSeat: 'Available on request',
        extraLuggage: 'Allowed free of charge'
      };
    }

    setEditingProduct(baseProduct);
  };

  // Edit action
  const handleEdit = (product: any) => {
    setEditingProduct(JSON.parse(JSON.stringify(product)));
  };

  // Duplicate action
  const handleDuplicate = (product: any) => {
    const content = getSiteContent();
    const allTours = content.tours || [];
    
    const duplicated = {
      ...JSON.parse(JSON.stringify(product)),
      id: `${productType}-${Date.now()}`,
      title: `${product.title} (Copy)`,
      slug: `${product.slug}-copy`,
      code: `${product.code ? product.code.split('-')[0] : 'PKG'}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Draft',
      lastUpdated: new Date().toISOString(),
      updatedBy: session?.name || 'Staff'
    };

    const updatedTours = [...allTours, duplicated];
    const updatedContent = { ...content, tours: updatedTours };
    saveSiteContent(updatedContent);
    syncProducts();
    alert(`Duplicated "${product.title}" into draft successfully.`);
  };

  // Delete action
  const handleDelete = (product: any) => {
    if (confirm(`Are you sure you want to permanently delete "${product.title}"? This cannot be undone.`)) {
      const content = getSiteContent();
      const allTours = content.tours || [];
      const updatedTours = allTours.filter((t: any) => t.id !== product.id);
      
      const updatedContent = { ...content, tours: updatedTours };
      saveSiteContent(updatedContent);
      syncProducts();
    }
  };

  // Save changes
  const handleSave = (updatedProd: any, isAutosave = false) => {
    if (!updatedProd.title) {
      if (!isAutosave) alert('Product Title is required.');
      return;
    }

    const currentContent = getSiteContent();
    const allTours = [...(currentContent.tours || [])];
    
    // Ensure both cover image fields are set
    const coverImage = updatedProd.image || updatedProd.img || 'https://images.unsplash.com/photo-1540206395-68808572332f';

    const preparedProduct = {
      ...updatedProd,
      image: coverImage,
      img: coverImage,
      lastUpdated: new Date().toISOString(),
      updatedBy: session?.name || 'Staff Member'
    };

    const index = allTours.findIndex((t: any) => t.id === preparedProduct.id);
    if (index >= 0) {
      allTours[index] = preparedProduct;
    } else {
      allTours.push(preparedProduct);
    }

    const updatedContent = { ...currentContent, tours: allTours };
    saveSiteContent(updatedContent);
    
    // Manage Version logs (only on manual save or if we want custom checkpoints)
    if (!isAutosave) {
      const historyItem = {
        versionId: `v-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        updatedBy: session?.name || 'Staff Member',
        role: session?.role || 'Staff',
        packageData: JSON.parse(JSON.stringify(preparedProduct))
      };
      const currentHistory = [historyItem, ...versionHistory].slice(0, 10);
      setVersionHistory(currentHistory);
      localStorage.setItem(`prod_versions_${preparedProduct.id}`, JSON.stringify(currentHistory));
    }

    // Keep active editing form in sync
    setEditingProduct(preparedProduct);
    syncProducts();

    if (!isAutosave) {
      alert('Product saved successfully!');
    }
  };

  // Bulk Actions
  const handleBulkAction = (action: 'publish' | 'archive' | 'delete', ids: string[]) => {
    const currentContent = getSiteContent();
    const allTours = [...(currentContent.tours || [])];

    let updatedTours = allTours;
    if (action === 'delete') {
      if (confirm(`Are you sure you want to permanently delete these ${ids.length} products?`)) {
        updatedTours = allTours.filter((t: any) => !ids.includes(t.id));
      } else {
        return;
      }
    } else {
      updatedTours = allTours.map((t: any) => {
        if (ids.includes(t.id)) {
          return {
            ...t,
            status: action === 'publish' ? 'Published' : 'Archived',
            lastUpdated: new Date().toISOString(),
            updatedBy: session?.name || 'Staff'
          };
        }
        return t;
      });
    }

    const updatedContent = { ...currentContent, tours: updatedTours };
    saveSiteContent(updatedContent);
    syncProducts();
    alert(`Bulk ${action} successfully executed on ${ids.length} items!`);
  };

  // Import Action
  const handleImport = (importedProducts: any[]) => {
    const currentContent = getSiteContent();
    const allTours = [...(currentContent.tours || [])];

    const cleanImports = importedProducts.map((p: any) => ({
      ...p,
      id: p.id || `prod-import-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: p.category || productType,
      status: p.status || 'Draft',
      lastUpdated: new Date().toISOString(),
      updatedBy: session?.name || 'Importer'
    }));

    const updatedTours = [...allTours, ...cleanImports];
    const updatedContent = { ...currentContent, tours: updatedTours };
    saveSiteContent(updatedContent);
    syncProducts();
  };

  // Restore Rollback action
  const handleRestoreVersion = (version: any) => {
    if (confirm(`Restore the historical version saved on ${version.timestamp} by ${version.updatedBy}?`)) {
      setEditingProduct(JSON.parse(JSON.stringify(version.packageData)));
      alert('Version restored to form! Remember to click Save Product to persist changes.');
    }
  };

  // Driver block screen
  if (isDriver) {
    return (
      <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-12 text-center text-slate-400 space-y-4 max-w-lg mx-auto my-12 shadow-2xl">
        <AlertTriangle className="text-[#D4A017] mx-auto" size={40} />
        <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wider">Access Denied</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Drivers are strictly restricted from editing catalog pricing or logistics. Please contact the Operations Desk if updates are necessary.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!editingProduct ? (
        <ProductListTable 
          products={products}
          productType={productType}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          onImport={handleImport}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <ProductTabsEditor 
          product={editingProduct}
          productType={productType}
          session={session}
          onChange={setEditingProduct}
          onSave={handleSave}
          onClose={() => { setEditingProduct(null); syncProducts(); }}
          versionHistory={versionHistory}
          onRestoreVersion={handleRestoreVersion}
          onPreview={setPreviewingProduct}
        />
      )}

      {/* Embedded Live Preview Modal Dialog */}
      {previewingProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 z-[9999] overflow-y-auto">
          <div className="w-full max-w-5xl my-auto">
            <HolidayPackagePreview pkg={previewingProduct} onClose={() => setPreviewingProduct(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
