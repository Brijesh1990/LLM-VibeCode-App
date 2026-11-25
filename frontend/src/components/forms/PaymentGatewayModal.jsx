import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Building2,
  Wallet,
  Sparkles,
  Download,
  AlertCircle,
  QrCode,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';
import { API_BASE_URL } from '../../constants';

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  course,
  batchId = null,
  batchName = '',
  amount = null,
  existingPaymentId = null,
  onSuccess,
}) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'wallet'
  const [gatewayConfig, setGatewayConfig] = useState({
    gateway: 'razorpay_test',
    key_id: 'rzp_test_NexusLms2026Key',
    currency: 'USD',
    test_mode: true,
  });

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(user?.full_name || 'Alex Student');

  // UPI state
  const [upiId, setUpiId] = useState('student@oksbi');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState('phonepe');

  // Load gateway config and create order when opened
  useEffect(() => {
    if (isOpen && course) {
      setPaymentSuccess(null);
      setProcessing(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');

      const initOrder = async () => {
        try {
          setLoadingOrder(true);
          const [cfg, ord] = await Promise.all([
            paymentService.getGatewayConfig().catch(() => ({
              gateway: 'razorpay_test',
              key_id: 'rzp_test_NexusLms2026Key',
              currency: 'USD',
              test_mode: true,
            })),
            paymentService.createGatewayOrder({
              course_id: course.id,
              batch_id: batchId ? Number(batchId) : null,
              amount: amount !== null ? Number(amount) : Number(course.fee),
              payment_type: 'full',
            }),
          ]);
          setGatewayConfig(cfg);
          setOrder(ord);
        } catch (err) {
          toast.error(err?.response?.data?.detail || 'Failed to initialize payment gateway order');
        } finally {
          setLoadingOrder(false);
        }
      };

      initOrder();
    }
  }, [isOpen, course, batchId, amount]);

  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvv('123');
    setCardName(user?.full_name || 'Alex Student');
    toast.success('Test Visa card details filled!');
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('nexuslms.test@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    toast.success('Merchant UPI ID copied');
  };

  const executePaymentVerification = async (methodName, transactionId) => {
    try {
      setProcessing(true);
      // Simulate realistic payment gateway authorization latency
      await new Promise((r) => setTimeout(r, 900));

      const payload = {
        order_id: order?.order_id || `order_test_${Date.now()}`,
        payment_id: transactionId || `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        signature: `sig_test_${Date.now()}`,
        course_id: course.id,
        batch_id: batchId ? Number(batchId) : null,
        amount: order?.amount || (amount !== null ? Number(amount) : Number(course.fee)),
        payment_method: methodName,
        existing_payment_id: existingPaymentId,
      };

      const result = await paymentService.verifyCheckout(payload);
      setPaymentSuccess(result);
      toast.success(result.message || 'Payment successfully processed!');
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Payment gateway verification failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayViaCard = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) {
      toast.error('Please enter all card details or click "Fill Test Card".');
      return;
    }
    const txnId = `pay_card_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    executePaymentVerification('credit_card', txnId);
  };

  const handlePayViaUpi = () => {
    if (!upiId) {
      toast.error('Please enter your UPI VPA handle.');
      return;
    }
    const txnId = `pay_upi_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    executePaymentVerification('upi', txnId);
  };

  const handlePayViaNetBanking = () => {
    const txnId = `pay_nb_${selectedBank.toLowerCase()}_${Date.now()}`;
    executePaymentVerification('net_banking', txnId);
  };

  const handlePayViaWallet = () => {
    const txnId = `pay_wallet_${selectedWallet}_${Date.now()}`;
    executePaymentVerification('wallet', txnId);
  };

  const payableAmount = order?.amount ?? (amount !== null ? Number(amount) : Number(course?.fee ?? 0));
  const token = localStorage.getItem('lms_access_token');

  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={processing ? undefined : onClose}
      title={paymentSuccess ? 'Payment Successful!' : 'NexusLMS Secure Payment Gateway'}
      subtitle={
        paymentSuccess
          ? 'Your transaction has been authorized and enrollment is active.'
          : 'Complete your tuition payment to unlock immediate course access.'
      }
      size="lg"
    >
      {paymentSuccess ? (
        <div className="text-center py-6 space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <Badge variant="emerald">TEST PAYMENT AUTHORIZED</Badge>
            <h3 className="text-2xl font-black text-slate-900">
              {formatCurrency(payableAmount)} Received
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              You are now enrolled in <strong className="text-slate-900">{course.title}</strong>
              {batchName ? ` (${batchName})` : ''}. Your official fee receipt is ready.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2 text-xs text-slate-600 max-w-md mx-auto">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Receipt Number:</span>
              <span className="font-mono font-bold text-slate-900">
                {paymentSuccess.receipt_number || paymentSuccess.payment?.receipt_number}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Invoice Number:</span>
              <span className="font-mono font-bold text-slate-900">
                {paymentSuccess.payment?.invoice_number}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Transaction ID:</span>
              <span className="font-mono text-slate-800 truncate">
                {paymentSuccess.payment?.transaction_reference}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold">Gateway Status:</span>
              <span className="font-bold text-emerald-600 uppercase">Paid & Verified</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {paymentSuccess.payment?.id && (
              <a
                href={`${API_BASE_URL}/payments/${paymentSuccess.payment.id}/receipt?token=${token}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
              >
                <Download className="w-4 h-4" /> Download Official PDF Receipt
              </a>
            )}
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Start Learning Now
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Test Mode Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-indigo-50/50 to-emerald-50 rounded-2xl p-4 border border-amber-200/80 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 uppercase tracking-wide">
                  Testing Gateway Mode Active
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-[10px] font-bold">
                  {gatewayConfig.key_id}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Test cards, simulated UPI, and sandbox net banking are fully enabled. No real currency is debited. Full database records, enrollment, and official PDF receipts are generated instantly.
              </p>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="indigo">{course.course_code}</Badge>
                {batchName && <Badge variant="slate">{batchName}</Badge>}
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">
                {course.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Instructor: {course.instructor_name} • Duration: {course.duration_weeks}w
              </p>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Payable Amount
              </span>
              <span className="text-2xl font-black text-slate-900 text-[#4F46E5]">
                {formatCurrency(payableAmount)}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {gatewayConfig.currency} • Full Tuition Access
              </span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-4 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'card'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Card</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upi'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'netbanking'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Net Banking</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallets</span>
            </button>
          </div>

          {/* TAB 1: Credit / Debit Card */}
          {activeTab === 'card' && (
            <form onSubmit={handlePayViaCard} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Card Credentials</span>
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="text-xs font-bold text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> One-Click Fill Test Card
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g. Alex Student"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full pl-10 pr-4 py-2 font-mono rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#4F46E5]"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    maxLength={5}
                    className="w-full px-3.5 py-2 font-mono rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3.5 py-2 font-mono rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={processing}
                  className="w-full py-3"
                  icon={Lock}
                >
                  Pay {formatCurrency(payableAmount)} via Test Card
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: UPI / QR Code */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
                {/* Simulated QR Code */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs shrink-0 text-center">
                  <div className="w-32 h-32 bg-slate-900 rounded-xl flex flex-col items-center justify-center p-2 text-white text-center">
                    <QrCode className="w-16 h-16 text-cyan-300" />
                    <span className="text-[9px] font-mono font-bold mt-1 tracking-wider text-slate-300">
                      SCAN TEST QR
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold mt-1.5 block">
                    Fast UPI Simulation
                  </span>
                </div>

                <div className="space-y-3 text-xs w-full">
                  <div>
                    <span className="font-semibold text-slate-500 block">Merchant UPI ID:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-900">
                        nexuslms.test@upi
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Your UPI Virtual Private Address (VPA)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                loading={processing}
                onClick={handlePayViaUpi}
                className="w-full py-3"
                icon={Lock}
              >
                Approve &amp; Pay {formatCurrency(payableAmount)} via UPI
              </Button>
            </div>
          )}

          {/* TAB 3: Net Banking */}
          {activeTab === 'netbanking' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 block">Select Your Bank</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'HDFC', name: 'HDFC Bank' },
                  { id: 'SBI', name: 'State Bank' },
                  { id: 'ICICI', name: 'ICICI Bank' },
                  { id: 'AXIS', name: 'Axis Bank' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedBank === b.id
                        ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                    <span className="text-xs block">{b.name}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                You will be redirected to the secure sandbox authentication server of <strong>{selectedBank} Bank</strong> to simulate authorization.
              </div>

              <Button
                variant="primary"
                loading={processing}
                onClick={handlePayViaNetBanking}
                className="w-full py-3"
                icon={Lock}
              >
                Authorize {formatCurrency(payableAmount)} with {selectedBank} Net Banking
              </Button>
            </div>
          )}

          {/* TAB 4: Wallets */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 block">Select Digital Wallet</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'phonepe', name: 'PhonePe' },
                  { id: 'paytm', name: 'Paytm' },
                  { id: 'gpay', name: 'Google Pay' },
                  { id: 'amazon', name: 'Amazon Pay' },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWallet(w.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedWallet === w.id
                        ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Wallet className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                    <span className="text-xs block">{w.name}</span>
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                loading={processing}
                onClick={handlePayViaWallet}
                className="w-full py-3"
                icon={Lock}
              >
                Pay {formatCurrency(payableAmount)} via {selectedWallet.toUpperCase()}
              </Button>
            </div>
          )}

          {/* Security & Compliance Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted Sandbox Gateway</span>
            </div>
            <span>PCI-DSS Compliant Simulation</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
