import { Button } from 'flowbite-react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { FaUser, FaFile, FaEye, FaTimes, FaCheck } from 'react-icons/fa';
import { formatDate } from '@/utils/dateUtils';
import { getVerificationRequested } from '@/app/api/pending-verification';

interface IVerificationDocument {
  uuid: string;
  type: string;
  url: string;
}


interface VerificationRequestModalProps {
   isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentSelectedUser?: IUser | null;
  currentSelectedVerificationRequested?: IVerificationRequested | null;
  pendingVerification?: IPendingVerification | null;
  onVerificationUpdate?: (id: string, action: "approve" | "decline") => void;
  isLoadingDetails?: boolean;
}

const VerifiedUserDetailsModal = ({
  isOpen,
  setIsOpen,
  currentSelectedUser,
  currentSelectedVerificationRequested,
  pendingVerification,
  onVerificationUpdate,
  isLoadingDetails,
}: VerificationRequestModalProps) => {
  const [data, setData] = useState<IVerificationRequested | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setData(null);
    setError(null);
    setIsOpen(false);
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500 text-white',
      approved: 'bg-green-500 text-white',
      declined: 'bg-red-500 text-white',
      rejected: 'bg-red-500 text-white',
    };
    return styles[status.toLowerCase()] || 'bg-gray-500 text-white';
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[900px] lg:max-w-[1000px] flex flex-col rounded-lg bg-white dark:bg-darkgray shadow-xl overflow-hidden"
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-500">
                <p>{error}</p>
                <Button color="gray" onClick={handleClose} className="mt-4">
                  Close
                </Button>
              </div>
            ) : data ? (
              <>
                {/* Modal Body */}
                <div className="flex flex-col md:flex-row">
                  {/* Left Side - User Profile */}
                  <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center text-center mb-6">
                      {data.user.profile_picture ? (
                        <img
                          src={data.user.profile_picture}
                          alt={data.user.name}
                          className="w-28 h-28 rounded-full object-cover mb-4"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mb-4">
                          <FaUser className="text-gray-500 dark:text-gray-400 text-4xl" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {data.user.name}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        @{data.user.username}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                        {data.user.email}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Followers</span>
                        <span className="text-gray-900 dark:text-white">{data.social_metrics.followers_count}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Following</span>
                        <span className="text-gray-900 dark:text-white">{data.social_metrics.following_count}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Posts</span>
                        <span className="text-gray-900 dark:text-white">-</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Joined</span>
                        <span className="text-gray-900 dark:text-white">{data.social_metrics.duration_since_joining}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Account Type</span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {data.subscription.plan.type || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Verification Details */}
                  <div className="w-full md:w-2/3 p-6">
                    {/* Verification Request Details */}
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Verification Request Details
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Request Type</p>
                          <span className="inline-block mt-1 px-3 py-1 bg-gray-700 text-white text-sm rounded-full">
                            {data.subscription.plan.name}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                          <span className={`inline-block mt-1 px-3 py-1 text-sm rounded-full uppercase ${getStatusStyles(data.status)}`}>
                            {data.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Current Stage</p>
                          <p className="text-gray-900 dark:text-white mt-1">{data.current_stage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                          <p className="text-gray-900 dark:text-white mt-1">
                            {data.created_at ? formatDate(data.created_at) : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Social Metrics */}
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Social Metrics
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Followers Count</p>
                          <p className="text-gray-900 dark:text-white mt-1">{data.social_metrics.followers_count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Following Count</p>
                          <p className="text-gray-900 dark:text-white mt-1">{data.social_metrics.following_count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Date Joined</p>
                          <p className="text-gray-900 dark:text-white mt-1">
                            {formatDate(data.social_metrics.date_joined)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Account Age</p>
                          <p className="text-gray-900 dark:text-white mt-1">{data.social_metrics.duration_since_joining}</p>
                        </div>
                      </div>
                    </div>

                    {/* Submitted Documents */}
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Submitted Documents
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.documents.map((doc) => (
                        <div
                          key={doc.uuid}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FaFile className="text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {formatDocumentType(doc.document_type)}
                            </span>
                          </div>
                          <a
                            href={doc.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-cyan-500 hover:text-cyan-600"
                          >
                            <FaEye />
                            View Document
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                  <Button color="gray" onClick={handleClose}>
                    Close
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      color="failure"
                      // onClick={() => onDecline?.(data.uuid)}
                    >
                      <FaTimes className="mr-2" />
                      Decline
                    </Button>
                    <Button
                      color="success"
                      // onClick={() => onApprove?.(data.uuid)}
                    >
                      <FaCheck className="mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VerifiedUserDetailsModal;