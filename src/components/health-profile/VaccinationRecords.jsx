// import React from 'react';
// import { PRIMARY, TEXT, BACKGROUND, BORDER, GRAY } from '../../constants/colors';
// import { FiShield, FiCalendar, FiUser, FiHash, FiFileText, FiAlertCircle } from 'react-icons/fi';

// const VaccinationCard = ({ record }) => {
//     const administeredDate = new Date(record.administeredDate).toLocaleDateString('vi-VN');

//     return (
//         <div className="bg-white rounded-xl p-6 border transition-all duration-300 hover:shadow-md"
//             style={{ borderColor: GRAY[200] }}>
//             <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                     <div className="flex items-center space-x-3 mb-4">
//                         <span className="flex items-center justify-center w-10 h-10 rounded-xl"
//                             style={{
//                                 background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)`,
//                                 color: 'white'
//                             }}>
//                             <FiShield className="h-5 w-5" />
//                         </span>
//                         <div>
//                             <h4 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
//                                 {record.vaccinationTypeName}
//                             </h4>
//                             <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
//                                 Mũi số {record.doseNumber}
//                             </p>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                         <div className="flex items-center">
//                             <FiCalendar className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
//                             <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
//                                 Ngày tiêm: {administeredDate}
//                             </span>
//                         </div>
//                         <div className="flex items-center">
//                             <FiUser className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
//                             <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
//                                 Người tiêm: {record.administeredBy}
//                             </span>
//                         </div>
//                         <div className="flex items-center">
//                             <FiHash className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
//                             <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
//                                 Số lô: {record.batchNumber || "Không có"}
//                             </span>
//                         </div>
//                         <div className="flex items-center">
//                             <FiAlertCircle className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
//                             <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
//                                 Trạng thái: {record.vaccinationStatus || "Không có"}
//                             </span>
//                         </div>
//                     </div>

//                     {(record.notes || record.noteAfterSession || record.symptoms) && (
//                         <div className="mt-4 pt-4 border-t" style={{ borderColor: GRAY[200] }}>
//                             {record.notes && (
//                                 <div className="mb-2">
//                                     <div className="flex items-center mb-1">
//                                         <FiFileText className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
//                                         <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
//                                             Ghi chú trước tiêm
//                                         </span>
//                                     </div>
//                                     <p className="text-sm pl-6" style={{ color: TEXT.PRIMARY }}>{record.notes}</p>
//                                 </div>
//                             )}
//                             {record.noteAfterSession && (
//                                 <div className="mb-2">
//                                     <div className="flex items-center mb-1">
//                                         <FiFileText className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
//                                         <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
//                                             Ghi chú sau tiêm
//                                         </span>
//                                     </div>
//                                     <p className="text-sm pl-6" style={{ color: TEXT.PRIMARY }}>{record.noteAfterSession}</p>
//                                 </div>
//                             )}
//                             {record.symptoms && (
//                                 <div>
//                                     <div className="flex items-center mb-1">
//                                         <FiAlertCircle className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
//                                         <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
//                                             Triệu chứng sau tiêm
//                                         </span>
//                                     </div>
//                                     <p className="text-sm pl-6" style={{ color: TEXT.PRIMARY }}>{record.symptoms}</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// const VaccinationRecords = ({ records = [] }) => {
//     // Sort records by date in descending order
//     const sortedRecords = Array.isArray(records) ? [...records].sort((a, b) =>
//         new Date(b.administeredDate) - new Date(a.administeredDate)
//     ) : [];

//     if (!records || records.length === 0) {
//         return (
//             <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                     <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
//                         <span className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
//                             style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
//                             <FiShield className="h-6 w-6" />
//                         </span>
//                         Lịch sử tiêm chủng
//                     </h2>
//                 </div>
//                 <div className="bg-white rounded-2xl p-6 border shadow-sm text-center"
//                     style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
//                     <p className="text-lg" style={{ color: TEXT.SECONDARY }}>
//                         Chưa có thông tin tiêm chủng
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
//                     <span className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
//                         style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
//                         <FiShield className="h-6 w-6" />
//                     </span>
//                     Lịch sử tiêm chủng
//                 </h2>
//             </div>

//             <div className="space-y-4">
//                 {sortedRecords.map((record, index) => (
//                     <VaccinationCard key={record.id || index} record={record} />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default VaccinationRecords;
