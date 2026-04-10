import React from 'react';
import { Church, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../I18nProvider';

export default function ChurchModeCard() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Church className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">{t('churchMode.newFeature', 'New Feature')}</p>
              <p className="font-bold text-white text-base leading-tight">{t('churchMode.title', 'Church Mode')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-green-400/20 border border-green-300/40 rounded-full px-2 py-0.5">
          <div className="w-1.5 h-1.5 bg-green-300 rounded-full" />
          <span className="text-xs text-green-200 font-medium">{t('churchMode.live', 'Live')}</span>
          </div>
        </div>

        <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
          {t('churchMode.description', "Follow your pastor's sermon in real time — see scripture references, take notes, and engage with your congregation.")}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(createPageUrl('ChurchMode'))}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-indigo-700 font-semibold text-sm py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Church className="w-4 h-4" />
            {t('churchMode.startJoin', 'Start / Join Session')}
          </button>
          <button
            onClick={() => navigate(createPageUrl('ChurchPartnership'))}
            className="flex items-center justify-center gap-1 bg-white/15 hover:bg-white/25 text-white text-sm py-2.5 px-3 rounded-lg transition-colors"
          >
            {t('churchMode.learnMore', 'Learn More')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-white/10 border-t border-white/20 px-5 py-2.5 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Church className="w-3.5 h-3.5 text-indigo-200" />
          <span className="text-xs text-indigo-200">{t('churchMode.pastorCode', 'Pastors: share a code')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-200" />
          <span className="text-xs text-indigo-200">{t('churchMode.memberCode', 'Members: enter the code')}</span>
        </div>
      </div>
    </div>
  );
}