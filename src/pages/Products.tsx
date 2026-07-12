import { useMemo, useState } from 'react';
import { Search, Package, ShoppingCart } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, humanize } from '@/lib/format';
import type { ProductType } from '@/types';

const TYPES: (ProductType | 'ALL')[] = ['ALL', 'FINISHED', 'SEMI_FINISHED', 'RAW_MATERIAL'];

const toneByType: Record<ProductType, 'success' | 'warning' | 'info'> = {
  FINISHED: 'success',
  SEMI_FINISHED: 'warning',
  RAW_MATERIAL: 'info',
};

export default function Products() {
  const { data: products, isLoading, isError } = useProducts();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<ProductType | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const list = products ?? [];
    return list.filter((p) => {
      const matchesQuery = p.productName.toLowerCase().includes(query.trim().toLowerCase());
      const matchesType = type === 'ALL' || p.productType === type;
      return matchesQuery && matchesType;
    });
  }, [products, query, type]);

  if (isLoading) return <PageLoader label="Loading products…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Product Catalog</h1>
        <p className="text-sm text-slate-500">Browse available products and current rates.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-52"
          value={type}
          onChange={(e) => setType(e.target.value as ProductType | 'ALL')}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t === 'ALL' ? 'All types' : humanize(t)}
            </option>
          ))}
        </Select>
      </div>

      {isError ? (
        <EmptyState
          icon={Package}
          title="Couldn't load products"
          description="Please check your connection and try again."
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try a different search or filter." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <Card key={product.productId}>
              <CardBody className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <Badge tone={toneByType[product.productType]}>
                    {humanize(product.productType)}
                  </Badge>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{product.productName}</h3>
                <p className="text-xs text-slate-400">
                  {product.standardSize ? `Standard size: ${product.standardSize}` : 'Size: —'}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-xs text-slate-400">Rate</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(product.rate)}</p>
                  </div>
                  <ButtonLink
                    to="/orders/new"
                    state={{ productId: product.productId }}
                    variant="outline"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Order
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
