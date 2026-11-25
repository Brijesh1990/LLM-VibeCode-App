import Swal from 'sweetalert2';

export async function confirmAction({
  title = 'Are you sure?',
  text = 'This action will update the database record.',
  confirmButtonText = 'Yes, proceed',
  cancelButtonText = 'Cancel',
  icon = 'warning',
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#4F46E5',
    cancelButtonColor: '#64748B',
    confirmButtonText,
    cancelButtonText,
  });
  return result.isConfirmed;
}

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-slate-900">{title || 'Confirm Action'}</h3>
        <p className="text-sm text-slate-600 mt-2">{message || 'Are you sure you want to continue?'}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-[#EF4444] text-white text-sm font-medium hover:bg-red-700 cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
