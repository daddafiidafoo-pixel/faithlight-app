import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ExternalLink, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

function formatAmount(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format((cents || 0) / 100);
}

const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-700',
  open: 'bg-amber-100 text-amber-700',
  void: 'bg-gray-100 text-gray-500',
  uncollectible: 'bg-red-100 text-red-600',
};

export default function BillingHistory() {
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const inv = await base44.entities.BillingInvoice.filter(
          { user_id: u.id }, '-invoice_created_at', 50
        ).catch(() => []);
        setInvoices(inv || []);
      } catch {
        // not authenticated
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-gray-600 text-sm">Please sign in to view billing history.</p>
      <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing History</h1>
          <p className="text-sm text-gray-500">Your past invoices and payments</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link to={createPageUrl('UserSettings')}>
          <Button variant="outline" size="sm" className="gap-1">
            <CreditCard className="w-3.5 h-3.5" /> Manage Subscription
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
          <CardDescription>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No invoices yet.</p>
              <p className="text-xs mt-1">Your billing history will appear here after your first payment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between gap-3 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatAmount(inv.amount_paid, inv.currency)}
                      </p>
                      <Badge className={`text-xs px-2 py-0.5 ${STATUS_COLORS[inv.status] || STATUS_COLORS.open}`}>
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {inv.invoice_created_at
                        ? new Date(inv.invoice_created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Date unknown'}
                      {inv.period_start && inv.period_end && (
                        <> · {new Date(inv.period_start).toLocaleDateString()} – {new Date(inv.period_end).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {inv.hosted_invoice_url && (
                      <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <ExternalLink className="w-3 h-3" /> View
                        </Button>
                      </a>
                    )}
                    {inv.invoice_pdf && (
                      <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs text-gray-500">
                          PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}