import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../components/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.22, delay: i * 0.06, ease: 'easeOut' } }),
};

export default function AmbassadorAgreements() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedAgreementId, setSelectedAgreementId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSignedModal, setShowSignedModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch {
        // silently fail
      }
    };
    checkAuth();
  }, []);

  const { data: templates = [] } = useQuery({
    queryKey: ['AmbassadorAgreementTemplates'],
    queryFn: async () => {
      try {
        return await base44.entities.AmbassadorAgreementTemplates.filter({
          isActive: true,
        });
      } catch {
        return [];
      }
    },
  });

  const { data: myAgreements = [], refetch: refetchAgreements } = useQuery({
    queryKey: ['AmbassadorAgreements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        return await base44.entities.AmbassadorAgreements.filter({
          userId: user.id,
        });
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const selectedAgreement = myAgreements.find(a => a.id === selectedAgreementId);

  const handleAcceptAgreement = async () => {
    if (!selectedTemplate || !user?.id) return;
    try {
      await base44.entities.AmbassadorAgreements.create({
        userId: user.id,
        templateId: selectedTemplate.id,
        title: selectedTemplate.title,
        version: selectedTemplate.version,
        content: selectedTemplate.content,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      });
      setShowPreviewModal(false);
      setSelectedTemplateId(null);
      refetchAgreements();
    } catch (error) {
      console.error('Error accepting agreement:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7F8FC', paddingBottom: 100 }}>
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '24px 20px' }}>
        {/* Title */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
            {t('ambassadorAgreements.title', 'Ambassador Agreements')}
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            {t('ambassadorAgreements.subtitle', 'Review and accept the agreements required for the FaithLight ambassador program.')}
          </p>
        </motion.div>

        {/* Status Summary */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 16,
            background: 'white',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
            {t('ambassadorAgreements.summaryTitle', 'Agreement Status')}
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                background: '#EEF9F0',
                color: '#15803D',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {t('ambassadorAgreements.active', 'Active')}
            </div>
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                background: '#F3F4F8',
                color: '#374151',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {myAgreements.length || 0} {t('ambassadorAgreements.total', 'total')}
            </div>
          </div>
        </motion.div>

        {/* Available Agreements */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 16,
            background: 'white',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
            {t('ambassadorAgreements.availableAgreements', 'Available Agreements')}
          </h2>

          {templates.length === 0 ? (
            <div style={{ textAlign: 'center', paddingY: 20 }}>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
                {t('ambassadorAgreements.noAgreements', 'No agreements available')}
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                {t('ambassadorAgreements.noAgreementsText', 'Agreement templates will appear here when published.')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid #F3F4F6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                      {template.title}
                    </p>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>
                      {template.version} • {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0 0' }}>
                      {template.required
                        ? t('ambassadorAgreements.required', 'Required')
                        : t('ambassadorAgreements.optional', 'Optional')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setShowPreviewModal(true);
                    }}
                    className="gap-2 ml-4"
                  >
                    <Eye size={14} />
                    {t('ambassadorAgreements.view', 'View')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* My Agreement History */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 16,
            background: 'white',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
            {t('ambassadorAgreements.myAgreementHistory', 'My Agreement History')}
          </h2>

          {myAgreements.length === 0 ? (
            <div style={{ textAlign: 'center', paddingY: 20 }}>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
                {t('ambassadorAgreements.noHistory', 'No agreement history yet')}
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                {t('ambassadorAgreements.noHistoryText', 'Accepted agreements will appear here.')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myAgreements.map((agreement) => (
                <div
                  key={agreement.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid #F3F4F6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                        {agreement.title}
                      </p>
                      <CheckCircle size={16} color="#22C55E" />
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>
                      {agreement.status} • {new Date(agreement.acceptedAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0 0' }}>
                      {agreement.version}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAgreementId(agreement.id);
                      setShowSignedModal(true);
                    }}
                    className="gap-2 ml-4"
                  >
                    <Eye size={14} />
                    {t('ambassadorAgreements.view', 'View')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('ambassadorAgreements.previewTitle', 'Agreement Preview')}
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedTemplate.version}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {selectedTemplate.content}
                </p>
              </div>

              <DialogFooter className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={handleAcceptAgreement}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {t('ambassadorAgreements.accept', 'Accept')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Signed Agreement Modal */}
      <Dialog open={showSignedModal} onOpenChange={setShowSignedModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('ambassadorAgreements.signedTitle', 'Accepted Agreement')}
            </DialogTitle>
          </DialogHeader>

          {selectedAgreement && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedAgreement.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedAgreement.version} • {selectedAgreement.status}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {selectedAgreement.content}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Accepted on {new Date(selectedAgreement.acceptedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}