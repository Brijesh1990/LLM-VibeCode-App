import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { API_BASE_URL } from '../../constants';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';

export default function VerifyCertificatePage() {
  const { certificateId } = useParams();
  const [query, setQuery] = useState(certificateId || '');
  const [result, setResult] = useState(null);
  const [publicList, setPublicList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (codeToLookup) => {
    const clean = (codeToLookup ?? query).trim();
    if (!clean) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await paymentService.verifyCertificate(clean);
      setResult(data);
      setQuery(data.certificate_number);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'No certificate matched this Certificate Number or Verification Code.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    paymentService
      .listPublicCertificates()
      .then((res) => {
        const items = res.items || [];
        setPublicList(items);
        if (certificateId) {
          handleVerify(certificateId);
        } else if (items[0]) {
          handleVerify(items[0].certificate_number);
        }
      })
      .catch(() => {
        if (certificateId) handleVerify(certificateId);
      });
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#4F46E5]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to NexusLMS Home
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Official Credential Registry
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8" data-aos="fade-up">
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-3">
              <Award className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Public Certificate Verification Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify the authenticity of any NexusLMS course certificate using its Certificate Number or Verification Code
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(query);
            }}
            className="flex flex-col sm:flex-row gap-3 mb-4"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Certificate No (e.g. CERT-2026-...) or Verification Code"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
            <Button type="submit" loading={loading}>
              Verify Credential
            </Button>
          </form>

          {publicList.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Issued Certificates in Registry:</span>
              {publicList.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleVerify(c.certificate_number)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] font-mono font-bold transition-colors cursor-pointer"
                >
                  {c.certificate_number}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
              <XCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Verification Unsuccessful</h4>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="p-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-indigo-50/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                      {result.is_valid ? 'Authentic & Active Credential' : 'Revoked Credential'}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {result.certificate_number}
                    </h3>
                  </div>
                </div>
                <a
                  href={`${API_BASE_URL}/certificates/${result.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-indigo-700"
                >
                  <Download className="w-4 h-4" /> Download Official PDF
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Recipient Student Name</p>
                  <p className="font-bold text-slate-900">{result.student_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Course Completed</p>
                  <p className="font-bold text-[#4F46E5]">{result.course_title}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Final Score & Grade</p>
                  <p className="font-bold text-slate-900">
                    {result.final_percentage}% — Grade {result.grade}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Completion & Issue Date</p>
                  <p className="font-bold text-slate-900">{formatDate(result.completion_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Verification Code</p>
                  <p className="font-mono text-xs font-bold text-slate-800">
                    {result.verification_code}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Issuing Institution</p>
                  <p className="font-bold text-slate-900">{result.institute_name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
