// CRUD for globally required components
function RequiredComponentsTab({
  requestForm,
  editingRequiredId,
  requiredRequests,
  onInputChange,
  onSubmit,
  onCancelEdit,
  onEdit,
  onDelete,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-1">
          <h3 className="text-lg font-extrabold text-slate-900">
            {editingRequiredId ? 'Edit Component' : 'Add Component'}
          </h3>
          {editingRequiredId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600 mb-6">These components will be visible to all vendors.</p>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Component Name</label>
            <input
              type="text"
              name="name"
              value={requestForm.name}
              onChange={onInputChange}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
              placeholder="e.g., ABS Sheet"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (optional)</label>
            <input
              type="text"
              name="description"
              value={requestForm.description}
              onChange={onInputChange}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
              placeholder="Specs, grade, or usage details"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              {editingRequiredId ? 'Update Component' : 'Add Component'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Components List</h3>
            <p className="text-sm text-slate-600">Vendors see these items in their dashboard.</p>
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total: {requiredRequests.length}
          </div>
        </div>
        {requiredRequests.length === 0 ? (
          <div className="text-center py-10 text-slate-600">
            <div className="text-5xl mb-3">📦</div>
            No components added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {requiredRequests.map((req) => (
              <div key={req.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{req.name || 'Component'}</h4>
                    <p className="text-xs text-slate-500 mt-1">Added {req.created_at ? new Date(req.created_at).toLocaleDateString() : '—'}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-700">
                    Active
                  </span>
                </div>

                <p className="text-sm text-slate-600 mt-4 min-h-[40px]">
                  {req.description || 'No notes provided.'}
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit(req)}
                    className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(req.id)}
                    className="flex-1 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RequiredComponentsTab;
