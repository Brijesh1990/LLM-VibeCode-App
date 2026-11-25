import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FileText, Download, BookOpen, Calendar, UserCheck } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { batchService } from '../../services/batchService';
import { API_BASE_URL } from '../../constants';
import { formatDate, formatBytes } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const [matRes, enrRes] = await Promise.all([
        courseService.listMaterials(),
        batchService.listEnrollments(),
      ]);
      setMaterials(matRes.items || []);
      setEnrollments(enrRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchCourse = !courseFilter || String(m.course_id) === String(courseFilter);
      const matchSearch =
        !search ||
        m.title?.toLowerCase().includes(search.toLowerCase()) ||
        m.course_title?.toLowerCase().includes(search.toLowerCase()) ||
        m.description?.toLowerCase().includes(search.toLowerCase()) ||
        m.file_name?.toLowerCase().includes(search.toLowerCase());
      return matchCourse && matchSearch;
    });
  }, [materials, courseFilter, search]);

  const token = localStorage.getItem('lms_access_token');

  const columns = [
    {
      header: 'Study Material',
      accessor: 'title',
      render: (m) => (
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{m.title}</p>
            <p className="text-xs text-slate-500 line-clamp-1">
              {m.description || m.file_name}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Course & Module',
      accessor: 'course_title',
      render: (m) => (
        <div>
          <p className="font-semibold text-slate-800">{m.course_title}</p>
          <p className="text-xs text-slate-500">{m.module_title || m.batch_name || 'General'}</p>
        </div>
      ),
    },
    {
      header: 'Format & Size',
      accessor: 'file_type',
      render: (m) => (
        <div className="flex items-center gap-2">
          <Badge variant="violet">{(m.file_type || 'PDF').toUpperCase()}</Badge>
          <span className="text-xs text-slate-500">{formatBytes(m.file_size_bytes)}</span>
        </div>
      ),
    },
    {
      header: 'Uploaded By',
      accessor: 'uploader_name',
      render: (m) => (
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-slate-800">{m.uploader_name}</p>
          <p className="text-slate-400">{formatDate(m.created_at)}</p>
        </div>
      ),
    },
    {
      header: 'Action',
      render: (m) => (
        <a
          href={`${API_BASE_URL}/materials/${m.id}/download?token=${token}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => toast.success(`Downloading "${m.title}"...`)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-xs transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </a>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading authorized study materials..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials & Reference Notes"
        subtitle="Download lecture slides, handbooks, code archives, and supplementary study materials for your enrolled courses."
        badge={<Badge variant="indigo">{filteredMaterials.length} Resources</Badge>}
      />

      {/* Search & Course Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search study materials by title, filename, or topic..."
          className="w-full sm:w-96"
        />
        <div className="w-full sm:w-72">
          <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All Enrolled Courses</option>
            {enrollments.map((e) => (
              <option key={e.course_id} value={e.course_id}>
                {e.course_title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredMaterials}
        emptyTitle="No study materials found"
        emptyDescription="Your instructors haven't uploaded any study materials matching your filter criteria yet."
      />
    </div>
  );
}
