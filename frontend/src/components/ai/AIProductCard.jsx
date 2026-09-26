import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '../Button';

export const AIProductCard = React.memo(({ product }) => {
  const navigate = useNavigate();

  const isUrgent = product.daysRemaining <= 4 || product.daysRemaining === 0;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isUrgent
        ? 'bg-rose-50/40 border-rose-200'
        : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${
            isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <Package className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{product.name}</h4>
              <span className="text-[10px] font-mono text-slate-400">({product.sku})</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
              <span>Stock: <strong>{product.stock}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <TrendingDown className="w-3.5 h-3.5" />
                Burn: {product.burnRate}
              </span>
              <span>•</span>
              <span className={`font-bold ${isUrgent ? 'text-rose-600' : 'text-amber-700'}`}>
                {product.daysRemaining === 0 ? '0 days (Out of Stock)' : `${product.daysRemaining} days left`}
              </span>
            </div>

            {product.warehouse && (
              <span className="text-[11px] text-slate-400 block mt-0.5">{product.warehouse}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(product.actionUrl || `/ai/stockout-prediction?product=${product.sku}`)}
            className="text-xs"
          >
            View Prediction
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(product.productUrl || '/products')}
            className="text-xs"
          >
            View Product
          </Button>
        </div>
      </div>
    </div>
  );
});

AIProductCard.displayName = 'AIProductCard';
