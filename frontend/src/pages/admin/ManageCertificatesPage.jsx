import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Award, Download, ShieldCheck, Plus } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { API_BASE_URL } from '../../constants';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export default function ManageCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ student_id: '', course_id: '', force_issue: true });
  const [issuing, setIssuing] = useState(false);

  const loadData = async () => {
    try {
      const [certRes, sRes, cRes] = await Promise.all([
        paymentService.listCertificates(),
        studentService.listStudents(),
        courseService.listCourses(),
      ]);
      setCertificates(certRes.items || []);
      setStudents(sRes.items || []);
      setCourses(cRes.items || []);
    } catch {
      toast.error('Failed to load certificates.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    setIssuing(true);
    try {
      await paymentService.generateCertificate({
        student_id: Number(form.student_id || students[0]?.id),
        course_id: Number(form.course_id || courses[0]?.id),
        force_issue: true,
      });
      toast.success('Official ReportLab PDF Certificate issued!');
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Certificate issuance failed.');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificate Issuance & Verification Registry"
        subtitle="Generate official ReportLab PDF certificates and manage public verification codes"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setForm({
                student_id: students[0]?.id || '',
                course_id: courses[0]?.id || '',
                force_issue: true,
              });
              setModalOpen(true);
            }}
          >
            Issue Certificate
          </Button>
        }
      />

      <DataTable
        data={certificates}
        columns={[
          {
            header: 'Certificate No',
            accessor: 'certificate_number',
            render: (r) => (
              <div>
                <p className="font-mono text-xs font-bold text-[#4F46E5]">{r.certificate_number}</p>
                <p className="font-mono text-[11px] text-slate-400">Verify: {r.verification_code}</p>
              </div>
            ),
          },
          {
            header: 'Student',
            accessor: 'student_name',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.student_name}</p>
                <p className="text-xs text-slate-500">{r.student_email}</p>
              </div>
            ),
          },
          { header: 'Course', accessor: 'course_title' },
          {
            header: 'Score & Grade',
            render: (r) => (
              <span className="font-bold text-emerald-700">
                {r.final_percentage}% (Grade {r.grade})
              </span>
            ),
          },
          {
            header: 'Issued On',
            render: (r) => formatDate(r.issue_date),
          },
          {
            header: 'Status',
            render: (r) => <StatusBadge status={r.is_revoked ? 'failed' : 'active'} />,
          },
          {
            header: 'Actions',
            render: (r) => (
              <div className="flex items-center gap-2">
                <a
                  href={`${API_BASE_URL}/certificates/${r.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-[#4F46E5] text-xs font-bold hover:bg-indigo-100"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </a>
                <Link
                  to={`/verify-certificate/${r.certificate_number}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Verify Page
                </Link>
              </div>
            ),
          },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue Course Completion Certificate"
      >
        <form onSubmit={handleIssue} className="space-y-4">
          <Select
            label="Select Student"
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.email})
              </option>
            ))}
          </Select>
          <Select
            label="Select Course"
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={issuing} icon={Award}>
              Generate & Issue PDF Certificate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
