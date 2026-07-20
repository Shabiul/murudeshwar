import React, { useState } from 'react';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_DOCS = [
  { id: '1', title: 'Adhar Card - John Doe', category: 'Guest ID', upload_date: '2026-07-16', file_size: '1.2 MB', uploader: 'Frontdesk Staff' },
  { id: '2', title: 'Scuba Instructor Cert - Ramesh K', category: 'Employee Credential', upload_date: '2026-07-15', file_size: '3.4 MB', uploader: 'HR Manager' },
  { id: '3', title: 'Kitchen AC Bill - Repair July', category: 'Maintenance Bill', upload_date: '2026-07-14', file_size: '850 KB', uploader: 'Maintenance Lead' },
  { id: '4', title: 'Passport Copy - Alice Green', category: 'Guest ID', upload_date: '2026-07-12', file_size: '2.1 MB', uploader: 'Frontdesk Staff' }
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [activeTab, setActiveTab] = useState('All'); // All, Guest ID, Employee Credential, Maintenance Bill

  // Upload modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Guest ID');
  const [fileSize, setFileSize] = useState('1.5 MB');

  const handleUpload = (e) => {
    e.preventDefault();
    if (!title) return;

    const newDoc = {
      id: Date.now().toString(),
      title,
      category,
      upload_date: new Date().toISOString().split('T')[0],
      file_size: fileSize,
      uploader: 'Administrator'
    };

    setDocs([newDoc, ...docs]);
    setIsModalOpen(false);
    setTitle('');
    alert('Document added to secure resort vault.');
  };

  const handleDeleteDoc = (docId) => {
    if (confirm('Are you sure you want to delete this document from the vault?')) {
      setDocs(docs.filter(d => d.id !== docId));
    }
  };

  const filteredDocs = docs.filter(d => activeTab === 'All' || d.category === activeTab);

  return (
    <CrmLayout title="Resort Document Vault" subtitle="Secure repository for guest identification, staff credentials, and maintenance vendor invoices.">
      
      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['All', 'Guest ID', 'Employee Credential', 'Maintenance Bill'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === cat
                  ? 'bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-900'
                  : 'bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 text-stone-600 dark:text-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-sm"
        >
          Secure Upload
        </button>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">{doc.category}</span>
              <h3 className="font-serif text-base text-stone-900 dark:text-stone-50 mt-1 mb-3">{doc.title}</h3>
              
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-850 pt-3">
                <p><span className="text-stone-400">Uploaded On:</span> {doc.upload_date}</p>
                <p><span className="text-stone-400">File Size:</span> {doc.file_size}</p>
                <p><span className="text-stone-400">Authorized By:</span> {doc.uploader}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => alert(`Downloading "${doc.title}"...`)}
                className="flex-grow py-2 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold rounded-xl"
              >
                Download File
              </button>
              <button
                onClick={() => handleDeleteDoc(doc.id)}
                className="px-3 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-xl hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-850 flex justify-between items-center bg-stone-50 dark:bg-stone-850">
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Secure Vault Upload</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Document Label / Name *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Passport copy - John Doe"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    >
                      <option value="Guest ID">Guest ID</option>
                      <option value="Employee Credential">Employee Credential</option>
                      <option value="Maintenance Bill">Maintenance Bill</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Estimated Size</label>
                    <input
                      type="text"
                      required
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      placeholder="e.g. 1.2 MB"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Select File Attachment *</label>
                  <input
                    type="file"
                    required
                    className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-50 dark:file:bg-stone-800 file:text-stone-700 dark:file:text-stone-300"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
                  >
                    Secure Vault Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CrmLayout>
  );
}
