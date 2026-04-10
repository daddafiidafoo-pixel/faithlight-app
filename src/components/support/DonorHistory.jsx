import React, { useState } from 'react';
import { Award, Calendar, ChevronDown, ChevronUp, RefreshCw, DollarSign } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import AcknowledgmentCertificate from './AcknowledgmentCertificate';

const TYPE_ICON = { monthly: RefreshCw, yearly: Calendar, custom: DollarSign };
const TYPE_COLOR = { monthly: 'bg-indigo-100 text-indigo-700', yearly: 'bg-purple-100 text-purple-700', custom: 'bg-amber-100 text-amber-700' };

export default function DonorHistory({ donations }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(null);

  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 dark:text-gray-600">
        <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">{t('support.noHistory', 'No donations yet.')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {donations.map((d) => {
        const Icon = TYPE_ICON[d.support_type] || DollarSign;
        const colorClass = TYPE_COLOR[d.support_type] || TYPE_COLOR.custom;
        const typeLabel =
          d.support_type === 'monthly' ? t('support.monthly', 'Monthly') :
          d.support_type === 'yearly' ? t('support.yearly', 'Yearly') :
          t('support.custom', 'Custom');
        const isOpen = expanded === d.id;

        return (
          <div key={d.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
            <button
              onClick={() => setExpanded(isOpen ? null : d.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  ${d.amount} — {typeLabel}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(d.created_date).toLocaleDateString()}
                  {d.status === 'completed' && (
                    <span className="ml-2 text-green-500 font-medium">✓</span>
                  )}
                </p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                {d.status === 'completed' ? (
                  <AcknowledgmentCertificate donation={d} />
                ) : (
                  <p className="text-sm text-gray-400">{t('support.pendingPayment', 'Payment pending or incomplete.')}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}