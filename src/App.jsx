import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/navbar/Navbar'
import HomePage from './components/home/HomePage'
import './App.css'
import Footer from './components/layout/footer/Footer'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<div className="p-8 text-center">Trang đăng nhập (đang phát triển)</div>} />
            <Route path="/register" element={<div className="p-8 text-center">Trang đăng ký (đang phát triển)</div>} />
            
            {/* Parent routes */}
            <Route path="/parent/health-profile" element={<div className="p-8 text-center">Danh sách hồ sơ sức khỏe (đang phát triển)</div>} />
            <Route path="/parent/health-profile/new" element={<div className="p-8 text-center">Khai báo hồ sơ sức khỏe (đang phát triển)</div>} />
            <Route path="/parent/vaccination/consent/new" element={<div className="p-8 text-center">Phiếu đồng ý tiêm chủng (đang phát triển)</div>} />
            <Route path="/parent/medication/request" element={<div className="p-8 text-center">Gửi thuốc (đang phát triển)</div>} />
            <Route path="/parent/medication/history" element={<div className="p-8 text-center">Lịch sử gửi thuốc (đang phát triển)</div>} />
            <Route path="/parent/dashboard" element={<div className="p-8 text-center">Bảng điều khiển (đang phát triển)</div>} />
            <Route path="/parent/health-check" element={<div className="p-8 text-center">Xác nhận kiểm tra (đang phát triển)</div>} />
            <Route path="/parent/health-check/results" element={<div className="p-8 text-center">Xem kết quả kiểm tra (đang phát triển)</div>} />
            
            {/* Staff routes */}
            <Route path="/staff/vaccination" element={<div className="p-8 text-center">Quản lý tiêm chủng (đang phát triển)</div>} />
            <Route path="/staff/vaccination/flow" element={<div className="p-8 text-center">Quy trình tiêm chủng (đang phát triển)</div>} />
            <Route path="/staff/medication" element={<div className="p-8 text-center">Quản lý thuốc (đang phát triển)</div>} />
            <Route path="/staff/health-events" element={<div className="p-8 text-center">Danh sách sự kiện y tế (đang phát triển)</div>} />
            <Route path="/staff/health-events/new" element={<div className="p-8 text-center">Thêm sự kiện mới (đang phát triển)</div>} />
            <Route path="/staff/health-check" element={<div className="p-8 text-center">Quản lý kiểm tra (đang phát triển)</div>} />
            <Route path="/staff/health-check/new" element={<div className="p-8 text-center">Lên lịch kiểm tra mới (đang phát triển)</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
